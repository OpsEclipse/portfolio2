import { getGroqClient } from '@/lib/groq';
import { getOpenRouterClient } from '@/lib/openrouter';
import {
	formatSources,
	getSystemPrompt,
} from '@/lib/prompts';
import { MODELS } from '@/lib/rag/constants';
import { classifyIntent } from '@/lib/rag/gatekeeper';
import { filterByRelevance, rerankDocuments } from '@/lib/rag/reranker';
import { retrieveFromMultipleNamespaces } from '@/lib/rag/retrieval';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map();
const USED_SOURCES_MARKER = '\n\n<<USED_SOURCES>>\n';
const USED_SOURCES_MARKER_ALT = '\n<<USED_SOURCES>>\n';
const USED_SOURCES_HEADER = '\n#### USED_SOURCES\n';
const USED_SOURCES_MARKER_END = '\n<</USED_SOURCES>>';
const USED_SOURCES_MARKER_MAX_LEN = Math.max(
	USED_SOURCES_MARKER.length,
	USED_SOURCES_MARKER_ALT.length,
	USED_SOURCES_HEADER.length
);

function getDocChunkId(doc) {
	return (
		doc?.metadata?.chunk_id ??
		doc?.metadata?.chunkId ??
		doc?.id ??
		''
	);
}

function parseUsedSources(text) {
	if (!text) return [];
	const cleaned = text
		.replace(/^#+\s*USED_SOURCES\s*/i, '')
		.trim();
	if (!cleaned || cleaned.toLowerCase() === 'none') return [];
	return cleaned
		.split(/[\n,]+/)
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function filterDocsByUsedSources(docs, usedIds) {
	if (!usedIds || usedIds.length === 0) return [];
	const usedSet = new Set(usedIds);
	return docs.filter((doc) => usedSet.has(String(getDocChunkId(doc))));
}

function getClientId(request) {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(clientId) {
	const now = Date.now();
	const entry = rateLimitStore.get(clientId);
	if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
		rateLimitStore.set(clientId, { start: now, count: 1 });
		return false;
	}

	entry.count += 1;
	if (entry.count > RATE_LIMIT_MAX) {
		return true;
	}

	return false;
}

async function* streamWithFallback(systemPrompt, messages, mode) {
	const config = {
		messages: [
			{ role: 'system', content: systemPrompt },
			...messages,
		],
		stream: true,
		temperature: mode === 'casual' ? 0.8 : 0.5,
		max_tokens: 1024,
	};

	// Try Groq first
	try {
		const groq = getGroqClient();
		const stream = await groq.chat.completions.create({
			model: MODELS.GENERATOR_FALLBACK,
			...config,
		});
		for await (const chunk of stream) {
			yield chunk;
		}
		return;
	} catch (error) {
		console.error('Groq generation failed, trying OpenRouter fallback:', error.message);
	}

	// Fallback to OpenRouter
	const openrouter = getOpenRouterClient();
	const stream = await openrouter.chat.completions.create({
		model: MODELS.GENERATOR,
		...config,
	});
	for await (const chunk of stream) {
		yield chunk;
	}
}

export async function POST(request) {
	try {
		const clientId = getClientId(request);
		if (isRateLimited(clientId)) {
			return Response.json(
				{ error: 'Rate limit exceeded. Please try again soon.' },
				{ status: 429 }
			);
		}

		const { messages, mode = 'professional' } = await request.json();

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return Response.json(
				{ error: 'Messages array is required' },
				{ status: 400 }
			);
		}

		// Get the latest user message for RAG
		const lastUserMessage = [...messages]
			.reverse()
			.find((m) => m.role === 'user');
		if (!lastUserMessage) {
			return Response.json(
				{ error: 'No user message found' },
				{ status: 400 }
			);
		}

		const query = lastUserMessage.content;

		// Step 1: Classify intent and determine namespaces
		const { namespaces, refinedQuery, skipRAG } = await classifyIntent(query);
		console.log(`Classified: namespaces=${JSON.stringify(namespaces)}, skipRAG=${skipRAG}, refinedQuery="${refinedQuery}"`);

		let relevantDocs = [];
		let rerankedDocs = [];

		// Step 2-4: Only do RAG if needed
		if (!skipRAG && namespaces.length > 0) {
			// Step 2: Retrieve documents from Pinecone (multiple namespaces)
			let documents = [];
			try {
				documents = await retrieveFromMultipleNamespaces(refinedQuery, namespaces);
			} catch (error) {
				console.error('Retrieval failed:', error);
			}

			// Step 3: Rerank documents
			if (documents.length > 0) {
				rerankedDocs = await rerankDocuments(refinedQuery, documents);
			}

			// Step 4: Filter by relevance
			relevantDocs = filterByRelevance(rerankedDocs);
		}

		const hasRelevantContext = relevantDocs.length > 0;

		// Step 5: Build system prompt with context
		const systemPrompt = getSystemPrompt(mode, relevantDocs);

		// Step 6: Generate response with streaming (Groq primary, OpenRouter fallback)
		const encoder = new TextEncoder();
		const messagesForModel = [{ role: 'user', content: query }];

		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					let pending = '';
					let capturingUsedSources = false;
					let usedSourcesText = '';

					const enqueueContent = (text) => {
						if (!text) return;
						const sseData = `data: ${JSON.stringify({ content: text })}\n\n`;
						controller.enqueue(encoder.encode(sseData));
					};

					const processPending = () => {
						while (pending) {
							if (capturingUsedSources) {
								const endIdx = pending.indexOf(USED_SOURCES_MARKER_END);
								if (endIdx === -1) {
									usedSourcesText += pending;
									pending = '';
									return;
								}
								usedSourcesText += pending.slice(0, endIdx);
								pending = pending.slice(endIdx + USED_SOURCES_MARKER_END.length);
								capturingUsedSources = false;
								continue;
							}

							const startIdxPrimary = pending.indexOf(USED_SOURCES_MARKER);
							const startIdxAlt = pending.indexOf(USED_SOURCES_MARKER_ALT);
							const startIdxHeader = pending.indexOf(USED_SOURCES_HEADER);
							let startIdx = -1;
							let markerLen = 0;
							const candidates = [
								{ idx: startIdxPrimary, len: USED_SOURCES_MARKER.length },
								{ idx: startIdxAlt, len: USED_SOURCES_MARKER_ALT.length },
								{ idx: startIdxHeader, len: USED_SOURCES_HEADER.length },
							].filter((item) => item.idx !== -1);
							if (candidates.length > 0) {
								candidates.sort((a, b) => a.idx - b.idx);
								startIdx = candidates[0].idx;
								markerLen = candidates[0].len;
							}

							if (startIdx === -1) {
								const safeLen = Math.max(
									0,
									pending.length - (USED_SOURCES_MARKER_MAX_LEN - 1)
								);
								if (safeLen === 0) return;
								enqueueContent(pending.slice(0, safeLen));
								pending = pending.slice(safeLen);
								return;
							}

							if (startIdx > 0) {
								enqueueContent(pending.slice(0, startIdx));
							}
							pending = pending.slice(startIdx + markerLen);
							capturingUsedSources = true;
						}
					};

					for await (const chunk of streamWithFallback(systemPrompt, messagesForModel, mode)) {
						const content = chunk?.choices?.[0]?.delta?.content;
						if (content) {
							pending += content;
							processPending();
						}
					}

					if (!capturingUsedSources && pending) {
						enqueueContent(pending);
						pending = '';
					}

					// After stream completes, append sources if we used RAG
					if (hasRelevantContext) {
						const usedSourceIds = parseUsedSources(usedSourcesText);
						const usedDocs = filterDocsByUsedSources(
							rerankedDocs,
							usedSourceIds
						);
						const suffix = formatSources(usedDocs);
						if (suffix) {
							enqueueContent(suffix);
						}
					}

					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					console.error('Stream error:', error);
					const errorData = `data: ${JSON.stringify({ error: 'Stream error occurred', detail: message })}\n\n`;
					controller.enqueue(encoder.encode(errorData));
					controller.close();
				}
			},
		});

		return new Response(readableStream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	} catch (error) {
		console.error('Chat API error:', error);
		return Response.json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

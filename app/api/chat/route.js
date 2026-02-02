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

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map();

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
					for await (const chunk of streamWithFallback(systemPrompt, messagesForModel, mode)) {
						const content = chunk.choices[0]?.delta?.content;
						if (content) {
							const sseData = `data: ${JSON.stringify({ content })}\n\n`;
							controller.enqueue(encoder.encode(sseData));
						}
					}

					// After stream completes, append sources if we used RAG
					if (hasRelevantContext) {
						const suffix = formatSources(rerankedDocs);
						if (suffix) {
							const sseData = `data: ${JSON.stringify({ content: suffix })}\n\n`;
							controller.enqueue(encoder.encode(sseData));
						}
					}

					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				} catch (error) {
					console.error('Stream error:', error);
					const errorData = `data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`;
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

import { formatSources, normalizeChatMode } from '../prompts.js';

import {
	filterDocsByUsedSources,
	parseUsedSources,
} from './sourceMarkers.js';
import { createRunSonnetAgent } from './runSonnetAgent.js';

const USED_SOURCES_BLOCK_REGEX =
	/\n?\n?<<USED_SOURCES>>[\s\S]*?<<\/USED_SOURCES>>/i;
const USED_SOURCES_MARKER = '\n\n<<USED_SOURCES>>\n';
const USED_SOURCES_MARKER_ALT = '\n<<USED_SOURCES>>\n';
const USED_SOURCES_MARKER_INLINE = '<<USED_SOURCES>>';
const USED_SOURCES_HEADER = '\n#### USED_SOURCES\n';
const USED_SOURCES_MARKER_END = '\n<</USED_SOURCES>>';
const USED_SOURCES_MARKER_END_INLINE = '<</USED_SOURCES>>';
const USED_SOURCES_MARKER_LOWER = USED_SOURCES_MARKER.toLowerCase();
const USED_SOURCES_MARKER_ALT_LOWER = USED_SOURCES_MARKER_ALT.toLowerCase();
const USED_SOURCES_MARKER_INLINE_LOWER =
	USED_SOURCES_MARKER_INLINE.toLowerCase();
const USED_SOURCES_HEADER_LOWER = USED_SOURCES_HEADER.toLowerCase();
const USED_SOURCES_MARKER_END_LOWER = USED_SOURCES_MARKER_END.toLowerCase();
const USED_SOURCES_MARKER_END_INLINE_LOWER =
	USED_SOURCES_MARKER_END_INLINE.toLowerCase();
const USED_SOURCES_START_MARKERS = [
	USED_SOURCES_MARKER_LOWER,
	USED_SOURCES_MARKER_ALT_LOWER,
	USED_SOURCES_MARKER_INLINE_LOWER,
	USED_SOURCES_HEADER_LOWER,
];
const USED_SOURCES_END_MARKERS = [
	USED_SOURCES_MARKER_END_LOWER,
	USED_SOURCES_MARKER_END_INLINE_LOWER,
];

function toSourceDocument(source) {
	return {
		id: source.chunkId,
		chunkId: source.chunkId,
		metadata: {
			chunk_id: source.chunkId,
			doc_title: source.title,
			heading: source.heading,
			source_url: source.url,
		},
	};
}

function dedupeSources(toolDocs) {
	const uniqueSources = new Map();

	for (const source of toolDocs || []) {
		if (!source?.chunkId || uniqueSources.has(source.chunkId)) {
			continue;
		}

		uniqueSources.set(source.chunkId, source);
	}

	return [...uniqueSources.values()];
}

function getTrailingMarkerPrefixLength(text, markers) {
	const lowerText = text.toLowerCase();
	let longestPrefix = 0;

	for (const marker of markers) {
		const maxPrefixLength = Math.min(marker.length - 1, lowerText.length);
		for (let length = maxPrefixLength; length > 0; length -= 1) {
			if (marker.startsWith(lowerText.slice(-length))) {
				longestPrefix = Math.max(longestPrefix, length);
				break;
			}
		}
	}

	return longestPrefix;
}

export function createPostHandler({
	runSonnetAgent = createRunSonnetAgent(),
	rateLimitWindowMs = 60_000,
	rateLimitMax = 20,
	rateLimitStore = new Map(),
} = {}) {
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

		if (!entry || now - entry.start > rateLimitWindowMs) {
			rateLimitStore.set(clientId, { start: now, count: 1 });
			return { limited: false, retryAfter: 0 };
		}

		entry.count += 1;
		if (entry.count > rateLimitMax) {
			return {
				limited: true,
				retryAfter: Math.max(
					1,
					Math.ceil((entry.start + rateLimitWindowMs - now) / 1000)
				),
			};
		}

		return { limited: false, retryAfter: 0 };
	}

	return async function POST(request) {
		try {
			const clientId = getClientId(request);
			const rateLimit = isRateLimited(clientId);
			if (rateLimit.limited) {
				return Response.json(
					{ error: 'Rate limit exceeded. Please try again soon.' },
					{
						status: 429,
						headers: { 'Retry-After': String(rateLimit.retryAfter) },
					}
				);
			}

			let payload;
			try {
				payload = await request.json();
			} catch {
				return Response.json(
					{ error: 'Invalid JSON body' },
					{ status: 400 }
				);
			}

			const { messages, mode = 'casual', intent } = payload;
			if (!Array.isArray(messages) || messages.length === 0) {
				return Response.json(
					{ error: 'Messages array is required' },
					{ status: 400 }
				);
			}

			const normalizedMode = normalizeChatMode(mode);
			const encoder = new TextEncoder();
			const { textStream, toolDocs, retrievalState } = await runSonnetAgent({
				messages,
				mode: normalizedMode,
				isGreeting: intent === 'greeting',
			});

			const readableStream = new ReadableStream({
				async start(controller) {
					try {
						let pending = '';
						let usedSourcesText = '';
						let capturingUsedSources = false;
						let statusSent = false;

						const enqueueEvent = (event) => {
							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
							);
						};

						const enqueueStatus = () => {
							if (statusSent || !retrievalState?.used) {
								return;
							}

							statusSent = true;
							enqueueEvent({
								type: 'status',
								label: 'Retrieved from the knowledge layer',
							});
						};

						const enqueueContent = (text) => {
							if (!text) {
								return;
							}

							if (!statusSent) {
								enqueueStatus();
							}

							enqueueEvent({
								type: 'content',
								content: text,
							});
						};

						const processPending = () => {
							while (pending) {
								const lowerPending = pending.toLowerCase();

								if (capturingUsedSources) {
									const endCandidates = [
										{
											idx: lowerPending.indexOf(
												USED_SOURCES_MARKER_END_LOWER
											),
											len: USED_SOURCES_MARKER_END.length,
										},
										{
											idx: lowerPending.indexOf(
												USED_SOURCES_MARKER_END_INLINE_LOWER
											),
											len: USED_SOURCES_MARKER_END_INLINE.length,
										},
									].filter((candidate) => candidate.idx !== -1);

									if (endCandidates.length === 0) {
										const trailingPrefixLength =
											getTrailingMarkerPrefixLength(
												pending,
												USED_SOURCES_END_MARKERS
											);
										const safeLen = pending.length - trailingPrefixLength;

										if (safeLen === 0) {
											return;
										}

										usedSourcesText += pending.slice(0, safeLen);
										pending = pending.slice(safeLen);
										return;
									}

									endCandidates.sort((left, right) => left.idx - right.idx);
									usedSourcesText += pending.slice(0, endCandidates[0].idx);
									pending = pending.slice(
										endCandidates[0].idx + endCandidates[0].len
									);
									capturingUsedSources = false;
									continue;
								}

								const startCandidates = [
									{
										idx: lowerPending.indexOf(USED_SOURCES_MARKER_LOWER),
										len: USED_SOURCES_MARKER.length,
									},
									{
										idx: lowerPending.indexOf(USED_SOURCES_MARKER_ALT_LOWER),
										len: USED_SOURCES_MARKER_ALT.length,
									},
									{
										idx: lowerPending.indexOf(USED_SOURCES_MARKER_INLINE_LOWER),
										len: USED_SOURCES_MARKER_INLINE.length,
									},
									{
										idx: lowerPending.indexOf(USED_SOURCES_HEADER_LOWER),
										len: USED_SOURCES_HEADER.length,
									},
								].filter((candidate) => candidate.idx !== -1);

								if (startCandidates.length === 0) {
									const trailingPrefixLength =
										getTrailingMarkerPrefixLength(
											pending,
											USED_SOURCES_START_MARKERS
										);
									const safeLen = pending.length - trailingPrefixLength;

									if (safeLen === 0) {
										return;
									}

									enqueueContent(pending.slice(0, safeLen));
									pending = pending.slice(safeLen);
									return;
								}

								startCandidates.sort((left, right) => left.idx - right.idx);
								if (startCandidates[0].idx > 0) {
									enqueueContent(pending.slice(0, startCandidates[0].idx));
								}

								pending = pending.slice(
									startCandidates[0].idx + startCandidates[0].len
								);
								capturingUsedSources = true;
							}
						};

						for await (const chunk of textStream) {
							if (!statusSent) {
								enqueueStatus();
							}
							pending += chunk;
							processPending();
						}

						if (!capturingUsedSources && pending) {
							const assistantText = pending
								.replace(USED_SOURCES_BLOCK_REGEX, '')
								.trimEnd();
							enqueueContent(assistantText);
							pending = '';
						}

						const uniqueToolDocs = dedupeSources(toolDocs);
						const usedDocs = filterDocsByUsedSources(
							uniqueToolDocs,
							parseUsedSources(usedSourcesText)
						);
						const sourceSuffix =
							usedDocs.length > 0
								? formatSources(usedDocs.map(toSourceDocument))
								: '';

						if (sourceSuffix) {
							enqueueContent(sourceSuffix);
						}

						controller.enqueue(encoder.encode('data: [DONE]\n\n'));
						controller.close();
					} catch (error) {
						console.error('Stream error:', error);
						const payload = JSON.stringify({
							error: 'Stream error occurred',
						});
						controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
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
				{ error: 'Internal server error' },
				{ status: 500 }
			);
		}
	};
}

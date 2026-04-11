import test from 'node:test';
import assert from 'node:assert/strict';

import { createPostHandler } from './postHandler.js';

function toTextStream(chunks) {
	return new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(chunk);
			}
			controller.close();
		},
	});
}

async function readSseBody(response) {
	return await response.text();
}

function getSseEvents(body) {
	return body
		.trim()
		.split('\n\n')
		.filter(Boolean)
		.map((event) => event.replace(/^data: /, ''))
		.filter((event) => event !== '[DONE]')
		.map((event) => JSON.parse(event));
}

test('streams direct model text as SSE chunks and ends with DONE', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'hello there',
				'\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>',
			]),
			toolDocs: [],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hi' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.equal(response.status, 200);
	assert.match(body, /data: {"type":"content","content":"hello there"}/);
	assert.match(body, /data: \[DONE\]/);
});

test('tool-backed answers emit a status event before content', async () => {
	const retrievalState = { used: false };
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: new ReadableStream({
				pull(controller) {
					retrievalState.used = true;
					controller.enqueue('vaultify was one of his projects.');
					controller.enqueue(
						'\n\n<<USED_SOURCES>>\nchunk-1\n<</USED_SOURCES>>'
					);
					controller.close();
				},
			}),
			toolDocs: [
				{
					chunkId: 'chunk-1',
					title: 'Projects',
					heading: 'Vaultify',
					url: 'https://example.com/vaultify',
				},
			],
			retrievalState,
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'tell me about vaultify' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const events = getSseEvents(await readSseBody(response));

	assert.deepEqual(events[0], {
		type: 'status',
		label: 'Retrieved from the knowledge layer',
	});
	assert.deepEqual(events[1], {
		type: 'content',
		content: 'vaultify was one of his projects.',
	});
});

test('direct answers stay content-only', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'hello there',
				'\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>',
			]),
			toolDocs: [],
			retrievalState: { used: false },
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hi' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const events = getSseEvents(await readSseBody(response));

	assert.deepEqual(events[0], {
		type: 'content',
		content: 'hello there',
	});
	assert.ok(events.every((event) => event.type === 'content'));
});

test('preserves incremental text chunks before the USED_SOURCES footer', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'hello',
				' there',
				'\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>',
			]),
			toolDocs: [],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hi' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.match(body, /data: {"type":"content","content":"hello"}/);
	assert.match(body, /data: {"type":"content","content":" there"}/);
});

test('appends formatted sources after a tool-backed answer', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'vaultify was one of his projects.',
				'\n\n<<USED_SOURCES>>\nchunk-1\n<</USED_SOURCES>>',
			]),
			toolDocs: [
				{
					chunkId: 'chunk-1',
					title: 'Projects',
					heading: 'Vaultify',
					url: 'https://example.com/vaultify',
				},
			],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'tell me about vaultify' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.match(body, /<<SOURCES>>/);
	assert.match(
		body,
		/\[Projects — Vaultify\]\(https:\/\/example.com\/vaultify\)/
	);
});

test('appends sources that are populated during async streaming', async () => {
	const toolDocs = [];
	let chunkIndex = 0;
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: new ReadableStream({
				pull(controller) {
					if (chunkIndex === 0) {
						chunkIndex += 1;
						controller.enqueue('vaultify was one of his projects.');
						return;
					}

					if (chunkIndex === 1) {
						chunkIndex += 1;
						toolDocs.push({
							chunkId: 'chunk-1',
							title: 'Projects',
							heading: 'Vaultify',
							url: 'https://example.com/vaultify',
						});
						controller.enqueue(
							'\n\n<<USED_SOURCES>>\nchunk-1\n<</USED_SOURCES>>'
						);
						controller.close();
					}
				},
			}),
			toolDocs,
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'tell me about vaultify' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.match(body, /<<SOURCES>>/);
	assert.match(
		body,
		/\[Projects — Vaultify\]\(https:\/\/example.com\/vaultify\)/
	);
});

test('returns 400 for invalid JSON without leaking parser details', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => {
			throw new Error('should not be called');
		},
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: '{"messages":',
	});

	const response = await handler(request);
	const payload = await response.json();

	assert.equal(response.status, 400);
	assert.deepEqual(payload, { error: 'Invalid JSON body' });
});

test('does not append sources when the model explicitly says none', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'he does not have verified info for that yet.',
				'\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>',
			]),
			toolDocs: [
				{
					chunkId: 'chunk-1',
					title: 'Projects',
					heading: 'Vaultify',
					url: 'https://example.com/vaultify',
				},
			],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'what is his private number?' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.doesNotMatch(body, /<<SOURCES>>/);
	assert.doesNotMatch(body, /Vaultify/);
});

test('does not append sources when used-source ids do not map to tool docs', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: toTextStream([
				'he worked on several things.',
				'\n\n<<USED_SOURCES>>\nchunk-missing\n<</USED_SOURCES>>',
			]),
			toolDocs: [
				{
					chunkId: 'chunk-1',
					title: 'Projects',
					heading: 'Vaultify',
					url: 'https://example.com/vaultify',
				},
			],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'tell me about his projects' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.doesNotMatch(body, /<<SOURCES>>/);
	assert.doesNotMatch(body, /Vaultify/);
});

test('returns a generic 500 JSON error when runner setup fails before streaming', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => {
			throw new Error('database password leaked');
		},
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hello' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const payload = await response.json();

	assert.equal(response.status, 500);
	assert.deepEqual(payload, { error: 'Internal server error' });
	assert.doesNotMatch(JSON.stringify(payload), /database password leaked/);
});

test('sends a generic SSE error when streaming fails mid-response', async () => {
	const handler = createPostHandler({
		runSonnetAgent: async () => ({
			textStream: (async function* () {
				yield 'partial answer';
				throw new Error('anthropic timeout token=secret');
			})(),
			toolDocs: [],
		}),
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hello' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const body = await readSseBody(response);

	assert.equal(response.status, 200);
	assert.match(
		body,
		/data: {"type":"content","content":"partial answer"}/
	);
	assert.match(body, /data: {"error":"Stream error occurred"}/);
	assert.doesNotMatch(body, /anthropic timeout token=secret/);
});

test('passes the full conversation history to the Sonnet runner', async () => {
	const messages = [
		{ role: 'user', content: 'hi' },
		{ role: 'assistant', content: 'hello' },
		{ role: 'user', content: 'tell me more' },
	];
	let receivedPayload;
	const handler = createPostHandler({
		runSonnetAgent: async (payload) => {
			receivedPayload = payload;
			return {
				textStream: toTextStream([
					'ok',
					'\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>',
				]),
				toolDocs: [],
			};
		},
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages,
			mode: 'weird-mode',
			intent: 'greeting',
		}),
	});

	await handler(request);

	assert.deepEqual(receivedPayload, {
		messages,
		mode: 'casual',
		isGreeting: true,
	});
});

test('returns 429 with Retry-After when the rate limit is hit', async () => {
	const rateLimitStore = new Map([
		['1.2.3.4', { start: Date.now(), count: 0 }],
	]);
	const handler = createPostHandler({
		runSonnetAgent: async () => {
			throw new Error('should not be called');
		},
		rateLimitMax: 0,
		rateLimitStore,
	});

	const request = new Request('http://localhost/api/chat', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-forwarded-for': '1.2.3.4',
		},
		body: JSON.stringify({
			messages: [{ role: 'user', content: 'hello' }],
			mode: 'casual',
		}),
	});

	const response = await handler(request);
	const payload = await response.json();

	assert.equal(response.status, 429);
	assert.equal(payload.error, 'Rate limit exceeded. Please try again soon.');
	assert.ok(response.headers.get('Retry-After'));
});

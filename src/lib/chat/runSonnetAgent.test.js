import test from 'node:test';
import assert from 'node:assert/strict';

import {
	createAnthropicCachedSystemMessage,
	ANTHROPIC_SYSTEM_CACHE_CONTROL,
} from '../anthropic.js';
import { getGreetingSystemPrompt, getSystemPrompt } from '../prompts.js';
import { createRunSonnetAgent } from './runSonnetAgent.js';

function createClosedTextStream() {
	return new ReadableStream({
		start(controller) {
			controller.close();
		},
	});
}

test('propagates provider stream errors instead of returning an empty reply', async () => {
	const providerError = new Error('Anthropic service unavailable');
	const runSonnetAgent = createRunSonnetAgent({
		streamTextImpl: () => ({
			fullStream: (async function* () {
				yield { type: 'error', error: providerError };
			})(),
		}),
		modelFactory: () => 'fake-model',
	});

	const { textStream } = await runSonnetAgent({
		messages: [{ role: 'user', content: 'hello' }],
		mode: 'casual',
		isGreeting: true,
	});

	await assert.rejects(
		async () => {
			for await (const _chunk of textStream) {
				// Consume the stream.
			}
		},
		/Anthropic service unavailable/
	);
});

test('adds Anthropic cache control to the system prompt without caching chat history', async () => {
	let streamTextOptions;
	const messages = [{ role: 'user', content: 'Tell me about Sparsh.' }];

	const runSonnetAgent = createRunSonnetAgent({
		streamTextImpl: (options) => {
			streamTextOptions = options;
			return { fullStream: createClosedTextStream() };
		},
		modelFactory: () => 'fake-model',
	});

	await runSonnetAgent({ messages, mode: 'casual', isGreeting: false });

	assert.deepEqual(
		streamTextOptions.system,
		createAnthropicCachedSystemMessage(getSystemPrompt('casual'))
	);
	assert.deepEqual(streamTextOptions.messages, messages);
	assert.equal(streamTextOptions.messages[0].providerOptions, undefined);
	assert.deepEqual(ANTHROPIC_SYSTEM_CACHE_CONTROL, { type: 'ephemeral' });
});

test('adds the same Anthropic cache control to greeting requests', async () => {
	let streamTextOptions;

	const runSonnetAgent = createRunSonnetAgent({
		streamTextImpl: (options) => {
			streamTextOptions = options;
			return { fullStream: createClosedTextStream() };
		},
		modelFactory: () => 'fake-model',
	});

	await runSonnetAgent({
		messages: [{ role: 'user', content: 'hello' }],
		mode: 'casual',
		isGreeting: true,
	});

	assert.deepEqual(
		streamTextOptions.system,
		createAnthropicCachedSystemMessage(getGreetingSystemPrompt())
	);
});

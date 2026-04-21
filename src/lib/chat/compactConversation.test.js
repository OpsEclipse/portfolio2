import test from 'node:test';
import assert from 'node:assert/strict';

import { createAnthropicCachedSystemMessage } from '../anthropic.js';
import { MODELS } from '../rag/constants.js';
import {
	COMPACTION_SYSTEM_PROMPT,
	createConversationCompactor,
} from './compactConversation.js';

test('createConversationCompactor skips the model call when there is nothing new to compact', async () => {
	let callCount = 0;
	const compactConversation = createConversationCompactor({
		generateTextImpl: async () => {
			callCount += 1;
			return { text: 'should not happen' };
		},
		modelFactory: () => 'fake-model',
	});

	const result = await compactConversation({
		existingSummary: 'Old summary',
		messages: [],
	});

	assert.equal(result, 'Old summary');
	assert.equal(callCount, 0);
});

test('createConversationCompactor sends the existing summary and transcript to the model', async () => {
	let generateTextOptions;
	const compactConversation = createConversationCompactor({
		generateTextImpl: async (options) => {
			generateTextOptions = options;
			return { text: '  New compact summary.  ' };
		},
		modelFactory: (modelId) => `model:${modelId}`,
	});

	const result = await compactConversation({
		existingSummary: 'Earlier chat summary.',
		messages: [
			{ role: 'user', content: 'What did we decide?' },
			{ role: 'assistant', content: 'We picked the chat summary route.' },
		],
	});

	assert.equal(result, 'New compact summary.');
	assert.equal(generateTextOptions.model, `model:${MODELS.CHAT}`);
	assert.deepEqual(
		generateTextOptions.system,
		createAnthropicCachedSystemMessage(COMPACTION_SYSTEM_PROMPT)
	);
	assert.match(generateTextOptions.prompt, /Earlier chat summary\./);
	assert.match(generateTextOptions.prompt, /User: What did we decide\?/);
	assert.match(
		generateTextOptions.prompt,
		/Assistant: We picked the chat summary route\./
	);
});

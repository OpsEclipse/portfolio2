import test from 'node:test';
import assert from 'node:assert/strict';

import {
	buildMessagesForModel,
	buildSummarySystemMessage,
	getCompactionPlan,
} from './conversationContext.js';

test('getCompactionPlan stays idle before the fourteenth message', () => {
	const plan = getCompactionPlan({
		messages: Array.from({ length: 13 }, (_, idx) => ({
			role: idx % 2 === 0 ? 'user' : 'assistant',
			content: String(idx + 1),
		})),
		compactedMessageCount: 0,
	});

	assert.equal(plan, null);
});

test('getCompactionPlan compacts the first twelve messages at message fourteen', () => {
	const messages = Array.from({ length: 14 }, (_, idx) => ({
		role: idx % 2 === 0 ? 'user' : 'assistant',
		content: String(idx + 1),
	}));

	const plan = getCompactionPlan({
		messages,
		compactedMessageCount: 0,
	});

	assert.deepEqual(plan, {
		messagesToCompact: messages.slice(0, 12),
		nextCompactedMessageCount: 12,
	});
});

test('getCompactionPlan only compacts newly unsummarized messages on the next cycle', () => {
	const messages = Array.from({ length: 28 }, (_, idx) => ({
		role: idx % 2 === 0 ? 'user' : 'assistant',
		content: String(idx + 1),
	}));

	const plan = getCompactionPlan({
		messages,
		compactedMessageCount: 12,
	});

	assert.deepEqual(plan, {
		messagesToCompact: messages.slice(12, 26),
		nextCompactedMessageCount: 26,
	});
});

test('buildMessagesForModel prepends the saved summary and keeps recent messages verbatim', () => {
	const messages = [
		{ role: 'user', content: '1' },
		{ role: 'assistant', content: '2' },
		{ role: 'user', content: '3' },
		{ role: 'assistant', content: '4' },
		{ role: 'user', content: '5' },
		{ role: 'assistant', content: '6' },
		{ role: 'user', content: '7' },
		{ role: 'assistant', content: '8' },
	];

	assert.deepEqual(
		buildMessagesForModel({
			summary: 'The user asked about Sparsh.',
			messages,
			compactedMessageCount: 5,
		}),
		[
			buildSummarySystemMessage('The user asked about Sparsh.'),
			...messages.slice(5),
		]
	);
});

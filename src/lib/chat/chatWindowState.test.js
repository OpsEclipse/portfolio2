import test from 'node:test';
import assert from 'node:assert/strict';

import {
	applyChatEventToMessages,
	hasMessageStatusLabel,
	parseSseChunk,
	shouldShowChatEmptyState,
	shouldShowChatSuggestions,
} from './chatWindowState.js';

test('shouldShowChatEmptyState returns true only when chat is loaded, idle, and empty', () => {
	assert.equal(
		shouldShowChatEmptyState({
			isLoaded: true,
			showInitializing: false,
			messages: [],
		}),
		true
	);

	assert.equal(
		shouldShowChatEmptyState({
			isLoaded: false,
			showInitializing: false,
			messages: [],
		}),
		false
	);

	assert.equal(
		shouldShowChatEmptyState({
			isLoaded: true,
			showInitializing: true,
			messages: [],
		}),
		false
	);

	assert.equal(
		shouldShowChatEmptyState({
			isLoaded: true,
			showInitializing: false,
			messages: [{ role: 'user', content: 'hi' }],
		}),
		false
	);
});

test('shouldShowChatSuggestions stays visible before the first user message', () => {
	assert.equal(
		shouldShowChatSuggestions({
			hasSubmittedUserMessage: false,
			messages: [],
		}),
		true
	);

	assert.equal(
		shouldShowChatSuggestions({
			hasSubmittedUserMessage: true,
			messages: [],
		}),
		false
	);

	assert.equal(
		shouldShowChatSuggestions({
			hasSubmittedUserMessage: false,
			messages: [{ role: 'user', content: 'hello' }],
		}),
		false
	);
});

test('both helpers return true for the empty initial state', () => {
	assert.equal(
		shouldShowChatEmptyState({
			isLoaded: true,
			showInitializing: false,
			messages: [],
		}),
		true
	);

	assert.equal(
		shouldShowChatSuggestions({
			hasSubmittedUserMessage: false,
			messages: [],
		}),
		true
	);
});

test('status event attaches statusLabel to the active assistant message', () => {
	const messages = applyChatEventToMessages(
		[{ role: 'assistant', content: '' }],
		{ type: 'status', label: 'Retrieved from the knowledge layer' }
	);

	assert.deepEqual(messages, [
		{
			role: 'assistant',
			content: '',
			statusLabel: 'Retrieved from the knowledge layer',
		},
	]);
});

test('content event appends without removing statusLabel', () => {
	const messages = applyChatEventToMessages(
		[
			{
				role: 'assistant',
				content: 'Hello',
				statusLabel: 'Retrieved from the knowledge layer',
			},
		],
		{ type: 'content', content: ' world' }
	);

	assert.deepEqual(messages, [
		{
			role: 'assistant',
			content: 'Hello world',
			statusLabel: 'Retrieved from the knowledge layer',
		},
	]);
});

test('hasMessageStatusLabel returns false when the label is missing', () => {
	assert.equal(hasMessageStatusLabel({ role: 'assistant', content: '' }), false);
	assert.equal(
		hasMessageStatusLabel({
			role: 'assistant',
			content: '',
			statusLabel: '',
		}),
		false
	);
});

test('parseSseChunk keeps incomplete SSE payloads until the next chunk arrives', () => {
	const firstPass = parseSseChunk(
		'',
		'data: {"type":"status","label":"Retrieved from the know'
	);

	assert.deepEqual(firstPass.events, []);
	assert.equal(
		firstPass.remainder,
		'data: {"type":"status","label":"Retrieved from the know'
	);

	const secondPass = parseSseChunk(
		firstPass.remainder,
		'ledge layer"}\n\ndata: {"type":"content","content":"Hi"}\n\n'
	);

	assert.deepEqual(secondPass.events, [
		{
			type: 'status',
			label: 'Retrieved from the knowledge layer',
		},
		{
			type: 'content',
			content: 'Hi',
		},
	]);
	assert.equal(secondPass.remainder, '');
});

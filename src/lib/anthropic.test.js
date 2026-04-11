import test from 'node:test';
import assert from 'node:assert/strict';

import {
	ANTHROPIC_PROMPT_CACHING_BETA,
	createPortfolioAnthropicProvider,
} from './anthropic.js';

test('creates the portfolio Anthropic provider with the prompt caching beta header', () => {
	const provider = { kind: 'anthropic-provider' };
	let receivedOptions;

	const result = createPortfolioAnthropicProvider({
		createProvider: (options) => {
			receivedOptions = options;
			return provider;
		},
	});

	assert.equal(result, provider);
	assert.deepEqual(receivedOptions, {
		headers: {
			'anthropic-beta': ANTHROPIC_PROMPT_CACHING_BETA,
		},
	});
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	formatSources,
	getGreetingSystemPrompt,
	getSystemPrompt,
} from './prompts.js';

test('getSystemPrompt instructs the model to use the retrieval tool for portfolio facts', () => {
	for (const mode of ['casual', 'slang']) {
		const prompt = getSystemPrompt(mode);

		assert.match(prompt, /searchPortfolioContext/);
		assert.match(prompt, /personal: interests, hobbies, background, values, public milestones/i);
		assert.match(prompt, /portfolio facts should come from retrieved context/i);
		assert.match(prompt, /if a portfolio-specific claim does not have retrieved context, say it is not verified in the database/i);
		assert.match(prompt, /only use conversation-established facts or injected legacy context when they are actually present/i);
		assert.match(prompt, /contact info or personal identifiers/i);
		assert.match(prompt, /if retrieved context or the injected legacy context contains the detail, it can be used/i);
		assert.match(prompt, /answer normally first/i);
		assert.match(prompt, /do not output only the footer/i);
		assert.match(prompt, /the footer must be exactly: `<<used_sources>>`/i);
		assert.match(prompt, /one chunk id per line/i);
		assert.match(prompt, /then `<<\/used_sources>>`/i);
	}
});

test('getSystemPrompt still includes injected context for legacy callers', () => {
	const prompt = getSystemPrompt('casual', [
		{
			id: 'chunk-1',
			metadata: {
				heading: 'Vaultify',
				doc_title: 'Projects',
				text: 'Vaultify is a Spotify replacement project.',
			},
		},
	]);

	assert.match(prompt, /Injected portfolio context/i);
	assert.match(prompt, /Vaultify/);
	assert.match(prompt, /chunk-1/);
});

test('getSystemPrompt keeps no-context portfolio claims unverified instead of falling back to memory', () => {
	const prompt = getSystemPrompt('casual');

	assert.match(
		prompt,
		/portfolio-specific claim does not have retrieved context/i
	);
	assert.match(
		prompt,
		/not verified in the database rather than guessing/i
	);
	assert.doesNotMatch(prompt, /answer from verified knowledge only/i);
});

test('formatSources keeps the frontend-rendered SOURCES block separate from the model contract', () => {
	const output = formatSources([
		{
			metadata: {
				doc_title: 'Projects',
				heading: 'Vaultify',
				source_url: 'https://example.com/vaultify',
			},
		},
	]);

	assert.match(output, /<<SOURCES>>/);
	assert.match(output, /\[Projects — Vaultify\]\(https:\/\/example.com\/vaultify\)/);
	assert.doesNotMatch(output, /<<USED_SOURCES>>/);
});

test('getGreetingSystemPrompt stays short and greeting-specific', () => {
	const prompt = getGreetingSystemPrompt();

	assert.match(prompt, /on-load greeter/i);
	assert.match(prompt, /1-2 sentences/i);
	assert.match(prompt, /max 40 words/i);
	assert.doesNotMatch(prompt, /searchPortfolioContext/);
	assert.doesNotMatch(prompt, /Injected portfolio context/i);
});

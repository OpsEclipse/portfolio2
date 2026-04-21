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
		assert.match(
			prompt,
			/professional: work history, education, skills, projects, contact info -> rag only/i
		);
		assert.match(
			prompt,
			/system: how this site and retrieval works -> rag only/i
		);
		assert.match(
			prompt,
			/retrieved context is the source of truth\. never guess or infer portfolio facts/i
		);
		assert.match(
			prompt,
			/that detail isn't verified in\s+my database/i
		);
		assert.match(
			prompt,
			/only share contact info .* if it appears\s+in retrieved or injected context/i
		);
		assert.match(prompt, /do not suggest external sources/i);
		assert.match(prompt, /after every answer, append this footer exactly/i);
		assert.match(prompt, /the footer must follow answer text, never appear alone/i);
		assert.match(prompt, /`<<used_sources>>`/i);
		assert.match(prompt, /chunk id per line, or "none" if no retrieval was used/i);
		assert.match(prompt, /`<<\/used_sources>>`/i);
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

test('getSystemPrompt explains how to use a compacted conversation summary message', () => {
	const prompt = getSystemPrompt('casual');

	assert.match(prompt, /conversation summary/i);
	assert.match(prompt, /newer verbatim messages/i);
});

test('getSystemPrompt keeps no-context portfolio claims unverified instead of falling back to memory', () => {
	const prompt = getSystemPrompt('casual');

	assert.match(
		prompt,
		/if no retrieved context exists for a claim/i
	);
	assert.match(
		prompt,
		/that detail isn't verified in\s+my database/i
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

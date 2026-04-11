import test from 'node:test';
import assert from 'node:assert/strict';

import { createSearchPortfolioContext } from './searchPortfolioContext.js';

test('searchPortfolioContext searches all namespaces by default', async () => {
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async (query, namespaces) => {
			assert.equal(query, 'what has sparsh built?');
			assert.deepEqual(namespaces, [
				'personal_life',
				'professional_life',
				'about_rag',
			]);
			return [
				{
					id: 'chunk-1',
					metadata: {
						heading: 'Vaultify',
						doc_title: 'Projects',
						source_url: 'https://example.com/vaultify',
						text: 'Vaultify is a Spotify replacement project.',
					},
					score: 0.9,
				},
				{
					id: 'chunk-2',
					metadata: {
						heading: 'StudyBuddy',
						doc_title: 'Projects',
						source_url: 'https://example.com/studybuddy',
						text: 'StudyBuddy helps manage assignments.',
					},
					score: 0.8,
				},
			];
		},
		rerankDocuments: async (_query, docs) =>
			docs.map((doc, index) => ({
				...doc,
				rerankScore: index === 0 ? 0.92 : 0.87,
			})),
		filterByRelevance: async (docs) => docs.slice(0, 1),
		extractDocText: (doc) => doc.metadata.text,
	});

	const result = await searchPortfolioContext({ query: 'what has sparsh built?' });

	assert.deepEqual(result.usedNamespaces, [
		'personal_life',
		'professional_life',
		'about_rag',
	]);
	assert.match(result.context, /Vaultify/);
	assert.equal(result.sources[0].chunkId, 'chunk-1');
	assert.equal(result.sources.length, 1);
});

test('searchPortfolioContext narrows the search when focus is provided', async () => {
	const calls = [];
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async (_query, namespaces) => {
			calls.push(namespaces);
			return [];
		},
		rerankDocuments: async () => [],
		filterByRelevance: () => [],
		extractDocText: () => '',
	});

	await searchPortfolioContext({
		query: 'how was this rag bot built?',
		focus: 'about_rag',
	});

	assert.deepEqual(calls, [['about_rag']]);
});

test('searchPortfolioContext keeps only valid namespaces from array focus and falls back on malformed focus', async () => {
	const calls = [];
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async (_query, namespaces) => {
			calls.push(namespaces);
			return [];
		},
		rerankDocuments: async () => [],
		filterByRelevance: async () => [],
		extractDocText: () => '',
	});

	await searchPortfolioContext({
		query: 'array focus',
		focus: ['personal_life', 'bogus'],
	});
	await searchPortfolioContext({
		query: 'empty array focus',
		focus: [],
	});
	await searchPortfolioContext({
		query: 'malformed focus',
		focus: { namespace: 'personal_life' },
	});

	assert.deepEqual(calls, [
		['personal_life'],
		['personal_life', 'professional_life', 'about_rag'],
		['personal_life', 'professional_life', 'about_rag'],
	]);
});

test('searchPortfolioContext falls back when relevance filtering removes everything', async () => {
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async () => [
			{
				id: 'chunk-1',
				metadata: {
					heading: 'Fallback Project',
					doc_title: 'Projects',
					source_url: 'https://example.com/fallback',
					text: 'This should still be used after empty filtering.',
				},
				score: 0.75,
			},
		],
		rerankDocuments: async (_query, docs) =>
			docs.map((doc) => ({ ...doc, rerankScore: 0.9 })),
		filterByRelevance: async () => [],
		extractDocText: (doc) => doc.metadata.text,
	});

	const result = await searchPortfolioContext({ query: 'fallback please' });

	assert.equal(result.sources.length, 1);
	assert.match(result.context, /Fallback Project/);
});

test('searchPortfolioContext returns empty results when retrieval throws', async () => {
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async () => {
			throw new Error('pinecone is down');
		},
		rerankDocuments: async () => [],
		filterByRelevance: async () => [],
		extractDocText: () => '',
	});

	const result = await searchPortfolioContext({
		query: 'what happened?',
		focus: 'personal_life',
	});

	assert.deepEqual(result, {
		context: '',
		sources: [],
		usedNamespaces: ['personal_life'],
	});
});

test('searchPortfolioContext skips docs with empty extracted text or extraction errors', async () => {
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async () => [
			{
				id: 'chunk-empty',
				metadata: {
					heading: 'Empty Note',
					doc_title: 'Projects',
					source_url: 'https://example.com/empty',
					text: '',
				},
				score: 0.8,
			},
			{
				id: 'chunk-full',
				metadata: {
					heading: 'Full Note',
					doc_title: 'Projects',
					source_url: 'https://example.com/full',
					text: 'This note has content.',
				},
				score: 0.79,
			},
		],
		rerankDocuments: async (_query, docs) =>
			docs.map((doc, index) => ({
				...doc,
				rerankScore: index === 0 ? 0.9 : 0.88,
			})),
		filterByRelevance: async (docs) => docs,
		extractDocText: (doc) => {
			if (doc.id === 'chunk-empty') {
				throw new Error('bad extraction');
			}

			return doc.metadata.text;
		},
	});

	const result = await searchPortfolioContext({ query: 'skip empty text' });

	assert.equal(result.sources.length, 1);
	assert.equal(result.sources[0].chunkId, 'chunk-full');
	assert.match(result.context, /Full Note/);
	assert.doesNotMatch(result.context, /Empty Note/);
});

test('searchPortfolioContext preserves top-level chunkId values', async () => {
	const searchPortfolioContext = createSearchPortfolioContext({
		retrieveFromMultipleNamespaces: async () => [
			{
				chunkId: 'chunk-top-level',
				metadata: {
					heading: 'Top Level Chunk',
					doc_title: 'Projects',
					source_url: 'https://example.com/top-level',
					text: 'This document only exposes chunkId at the top level.',
				},
				score: 0.81,
			},
		],
		rerankDocuments: async (_query, docs) => docs,
		filterByRelevance: async (docs) => docs,
		extractDocText: (doc) => doc.metadata.text,
	});

	const result = await searchPortfolioContext({
		query: 'top level chunk id',
	});

	assert.equal(result.sources[0].chunkId, 'chunk-top-level');
	assert.match(result.context, /\[id:chunk-top-level\]/);
});

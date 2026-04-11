import test from 'node:test';
import assert from 'node:assert/strict';

import {
	filterDocsByUsedSources,
	parseUsedSources,
} from './sourceMarkers.js';

test('parseUsedSources extracts explicit chunk ids', () => {
	const ids = parseUsedSources(
		'\n\n<<USED_SOURCES>>\nid: chunk-1\nchunk id: chunk-2\n<</USED_SOURCES>>'
	);

	assert.deepEqual(ids, ['chunk-1', 'chunk-2']);
});

test('parseUsedSources dedupes explicit chunk ids and preserves opaque ids', () => {
	const ids = parseUsedSources(
		'<<USED_SOURCES>>\nid: CHUNK.1:Alpha/Beta\nchunk id: CHUNK.1:Alpha/Beta\nid: chunk-2.3:four/five\n<</USED_SOURCES>>'
	);

	assert.deepEqual(ids, ['CHUNK.1:Alpha/Beta', 'chunk-2.3:four/five']);
});

test('parseUsedSources returns an empty list for none', () => {
	assert.deepEqual(
		parseUsedSources('\n\n<<USED_SOURCES>>\nnone\n<</USED_SOURCES>>'),
		[]
	);
});

test('parseUsedSources falls back to plain ids in order', () => {
	assert.deepEqual(
		parseUsedSources(
			'<<USED_SOURCES>>\nchunk-1\nchunk-2,chunk-3\nchunk-4\n<</USED_SOURCES>>'
		),
		['chunk-1', 'chunk-2', 'chunk-3', 'chunk-4']
	);
});

test('parseUsedSources parses markdown-style footer lines as explicit ids', () => {
	assert.deepEqual(
		parseUsedSources(
			'<<USED_SOURCES>>\n- id: chunk-1\n- chunk id: chunk-2\n<</USED_SOURCES>>'
		),
		['chunk-1', 'chunk-2']
	);
});

test('filterDocsByUsedSources keeps only referenced docs', () => {
	const docs = [
		{ id: 'chunk-1', metadata: { heading: 'Vaultify' } },
		{ id: 'chunk-2', metadata: { heading: 'StudyBuddy' } },
	];

	const filtered = filterDocsByUsedSources(docs, ['chunk-2']);

	assert.deepEqual(filtered, [docs[1]]);
});

test('filterDocsByUsedSources supports alternate doc id fields', () => {
	const docs = [
		{ metadata: { chunk_id: 'chunk-1' } },
		{ metadata: { chunkId: 'chunk-2' } },
		{ chunkId: 'chunk-3' },
	];

	assert.deepEqual(filterDocsByUsedSources(docs, ['chunk-1']), [docs[0]]);
	assert.deepEqual(filterDocsByUsedSources(docs, ['chunk-2']), [docs[1]]);
	assert.deepEqual(filterDocsByUsedSources(docs, ['chunk-3']), [docs[2]]);
});

const USED_SOURCE_LINE_REGEX = /^(?:[-*]\s*)?(?:chunk\s*id|id)\s*[:=]\s*(.+?)\s*$/i;

function getDocChunkId(doc) {
	return (
		doc?.metadata?.chunk_id ??
		doc?.metadata?.chunkId ??
		doc?.chunkId ??
		doc?.id ??
		''
	);
}

export function parseUsedSources(text) {
	if (!text) {
		return [];
	}

	const cleaned = text
		.trim()
		.replace(/^#+\s*USED_SOURCES\s*/i, '')
		.replace(/^<<USED_SOURCES>>/i, '')
		.replace(/<<\/USED_SOURCES>>$/i, '')
		.trim();

	if (!cleaned || cleaned.toLowerCase() === 'none') {
		return [];
	}

	const explicitIds = cleaned
		.split('\n')
		.map((line) => line.trim())
		.map((line) => line.match(USED_SOURCE_LINE_REGEX)?.[1])
		.filter(Boolean);

	if (explicitIds.length > 0) {
		return [...new Set(explicitIds)];
	}

	return cleaned
		.split(/[\n,]+/)
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export function filterDocsByUsedSources(docs, usedIds) {
	if (!usedIds?.length) {
		return [];
	}

	const usedSet = new Set(usedIds);
	return docs.filter((doc) => usedSet.has(String(getDocChunkId(doc))));
}

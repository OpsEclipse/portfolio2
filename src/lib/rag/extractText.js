const TEXT_KEYS = [
	'contextualized_text',
	'text',
	'content',
	'chunk',
	'body',
	'document',
	'pageContent',
	'page_content',
	'summary',
];

function normalizeText(value) {
	if (typeof value === 'string') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.filter((item) => typeof item === 'string').join('\n');
	}
	if (typeof value === 'number') {
		return String(value);
	}
	return '';
}

export function extractDocText(doc) {
	if (!doc || !doc.metadata) {
		return '';
	}
	for (const key of TEXT_KEYS) {
		if (key in doc.metadata) {
			const text = normalizeText(doc.metadata[key]);
			if (text) {
				return text;
			}
		}
	}
	return '';
}

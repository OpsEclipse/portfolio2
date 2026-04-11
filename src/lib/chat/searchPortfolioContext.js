import { extractDocText as defaultExtractDocText } from '../rag/extractText.js';
import { NAMESPACES } from '../rag/constants.js';

const ALL_NAMESPACES = [
	NAMESPACES.PERSONAL,
	NAMESPACES.PROFESSIONAL,
	NAMESPACES.ABOUT_RAG,
];

function getDocChunkId(doc) {
	return (
		doc?.metadata?.chunk_id ??
		doc?.metadata?.chunkId ??
		doc?.chunkId ??
		doc?.id ??
		''
	);
}

function resolveNamespaces(focus) {
	if (!focus || focus === 'all') {
		return ALL_NAMESPACES;
	}

	if (typeof focus === 'string') {
		return ALL_NAMESPACES.includes(focus) ? [focus] : ALL_NAMESPACES;
	}

	if (Array.isArray(focus)) {
		const namespaces = [...new Set(focus.filter((namespace) => ALL_NAMESPACES.includes(namespace)))];
		return namespaces.length > 0 ? namespaces : ALL_NAMESPACES;
	}

	return ALL_NAMESPACES;
}

function safeExtractText(extractDocText, doc) {
	try {
		return extractDocText(doc).trim();
	} catch {
		return '';
	}
}

async function defaultRetrieveFromMultipleNamespaces(query, namespaces) {
	const { retrieveFromMultipleNamespaces } = await import(
		'../rag/retrieval.js'
	);
	return retrieveFromMultipleNamespaces(query, namespaces);
}

async function defaultRerankDocuments(query, documents) {
	const { rerankDocuments } = await import('../rag/reranker.js');
	return rerankDocuments(query, documents);
}

async function defaultFilterByRelevance(documents) {
	const { filterByRelevance } = await import('../rag/reranker.js');
	return filterByRelevance(documents);
}

export function createSearchPortfolioContext({
	retrieveFromMultipleNamespaces = defaultRetrieveFromMultipleNamespaces,
	rerankDocuments = defaultRerankDocuments,
	filterByRelevance = defaultFilterByRelevance,
	extractDocText = defaultExtractDocText,
} = {}) {
	return async function searchPortfolioContext({ query, focus = 'all' }) {
		const usedNamespaces = resolveNamespaces(focus);
		let topDocs = [];

		try {
			const retrievedDocs = await retrieveFromMultipleNamespaces(
				query,
				usedNamespaces
			);
			const rerankedDocs = retrievedDocs.length
				? await rerankDocuments(query, retrievedDocs)
				: [];
			const relevantDocs = await filterByRelevance(rerankedDocs);
			const docsForContext =
				relevantDocs.length > 0 ? relevantDocs : rerankedDocs;

			topDocs = docsForContext
				.map((doc) => {
					const text = safeExtractText(extractDocText, doc);
					return text ? { doc, text } : null;
				})
				.filter(Boolean)
				.slice(0, 5);
		} catch {
			return {
				context: '',
				sources: [],
				usedNamespaces,
			};
		}

		return {
			context: topDocs
				.map(({ doc, text }) => {
					const heading = doc.metadata?.heading || 'Reference';
					const chunkId = getDocChunkId(doc);
					return `### ${heading} [id:${chunkId}]\n${text}`;
				})
				.join('\n\n'),
			sources: topDocs.map(({ doc, text }) => {
				return {
					chunkId: getDocChunkId(doc),
					title: doc.metadata?.doc_title || 'Reference Doc',
					heading: doc.metadata?.heading || '',
					namespace: doc.namespace || 'unknown',
					url: doc.metadata?.source_url || '',
					snippet: text.slice(0, 280),
				};
			}),
			usedNamespaces,
		};
	};
}

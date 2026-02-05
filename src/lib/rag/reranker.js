import { getPineconeClient } from '../pinecone';
import { CONFIG, MODELS } from './constants';
import { extractDocText } from './extractText';

export async function rerankDocuments(query, documents) {
	if (!documents || documents.length === 0) {
		return [];
	}

	const pinecone = getPineconeClient();

	try {
		// Extract text content from documents
		const textsWithIndex = documents
			.map((doc, idx) => ({
				idx,
				id: doc.id ?? String(idx),
				text: extractDocText(doc),
			}))
			.filter((item) => item.text.trim().length > 0);

		if (textsWithIndex.length === 0) {
			console.warn('No valid documents to rerank after filtering empty texts');
			return documents.slice(0, CONFIG.TOP_N).map((doc) => ({
				...doc,
				rerankScore: doc.score,
			}));
		}

		// Pinecone rerank expects array of documents with text
		const documentsToRerank = textsWithIndex.map((item) => ({
			id: item.id,
			text: item.text,
		}));
		const idToOriginalIdx = new Map(
			textsWithIndex.map((item) => [item.id, item.idx])
		);

		console.log(`Reranking ${documentsToRerank.length} documents`);

		const response = await pinecone.inference.rerank({
			model: MODELS.RERANKER,
			query,
			documents: documentsToRerank,
			topN: CONFIG.TOP_N,
			returnDocuments: false,
		});

		// Map reranked results back to original documents with scores
		const reranked = response.data
			.map((result) => {
				let originalIdx = null;
				if (typeof result.index === 'number') {
					originalIdx = textsWithIndex[result.index]?.idx ?? null;
				} else if (result.document?.id) {
					originalIdx = idToOriginalIdx.get(result.document.id) ?? null;
				}
				if (originalIdx === null) {
					return null;
				}
				return {
					...documents[originalIdx],
					rerankScore: result.score,
				};
			})
			.filter(Boolean);

		if (reranked.length === 0) {
			return documents.slice(0, CONFIG.TOP_N).map((doc) => ({
				...doc,
				rerankScore: doc.score,
			}));
		}

		return reranked;
	} catch (error) {
		console.error('Reranking failed:', error);
		// Fallback: return top N by original score
		return documents.slice(0, CONFIG.TOP_N).map((doc) => ({
			...doc,
			rerankScore: doc.score,
		}));
	}
}

export function filterByRelevance(documents, minScore = CONFIG.MIN_RERANK_SCORE) {
	if (!documents || documents.length === 0) return [];
	const filtered = documents.filter((doc) => doc.rerankScore >= minScore);
	if (filtered.length > 0) {
		return filtered;
	}
	// Fail-open: keep top results when threshold filters everything out.
	const fallbackCount = 3;
	console.warn(
		`No documents met rerank min score (${minScore}); using top ${fallbackCount} reranked results.`
	);
	return documents
		.slice()
		.sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0))
		.slice(0, fallbackCount);
}

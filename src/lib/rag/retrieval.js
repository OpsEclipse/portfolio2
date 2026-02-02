import OpenAI from 'openai';
import { getPineconeIndex } from '../pinecone';
import { CONFIG, MODELS } from './constants';

let openaiClient = null;

function getOpenAIClient() {
	if (!openaiClient) {
		if (!process.env.OPENAI_API_KEY) {
			throw new Error('OPENAI_API_KEY environment variable is not set');
		}
		openaiClient = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}
	return openaiClient;
}

export async function embedQuery(query) {
	const openai = getOpenAIClient();

	const response = await openai.embeddings.create({
		model: MODELS.EMBEDDINGS,
		input: query,
	});

	return response.data[0].embedding;
}

export async function retrieveDocuments(embedding, namespace) {
	const index = getPineconeIndex();
	const ns = index.namespace(namespace);

	console.log(`Querying Pinecone namespace: ${namespace}`);

	const results = await ns.query({
		vector: embedding,
		topK: CONFIG.TOP_K,
		includeMetadata: true,
	});

	console.log(`Pinecone returned ${results.matches?.length || 0} matches from ${namespace}`);

	return (results.matches || []).map((match) => ({
		id: match.id,
		score: match.score,
		metadata: match.metadata,
		namespace,
	}));
}

export async function retrieveFromQuery(query, namespace) {
	const embedding = await embedQuery(query);
	return retrieveDocuments(embedding, namespace);
}

export async function retrieveFromMultipleNamespaces(query, namespaces) {
	if (!namespaces || namespaces.length === 0) {
		return [];
	}

	const embedding = await embedQuery(query);

	// Query all namespaces in parallel
	const results = await Promise.all(
		namespaces.map((ns) => retrieveDocuments(embedding, ns))
	);

	// Flatten and sort by score
	const allDocs = results.flat().sort((a, b) => b.score - a.score);

	console.log(`Retrieved ${allDocs.length} total documents from ${namespaces.length} namespace(s)`);

	return allDocs;
}

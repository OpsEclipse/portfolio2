import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient = null;

export function getPineconeClient() {
	if (!pineconeClient) {
		if (!process.env.PINECONE_API_KEY) {
			throw new Error('PINECONE_API_KEY environment variable is not set');
		}
		pineconeClient = new Pinecone({
			apiKey: process.env.PINECONE_API_KEY,
		});
	}
	return pineconeClient;
}

export function getPineconeIndex() {
	const indexName = process.env.PINECONE_INDEX || 'portfolio-rag';
	return getPineconeClient().index(indexName);
}

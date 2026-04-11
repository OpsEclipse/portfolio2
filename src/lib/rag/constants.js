export const NAMESPACES = {
	PERSONAL: 'personal_life',
	PROFESSIONAL: 'professional_life',
	ABOUT_RAG: 'about_rag',
};

export const MODELS = {
	CHAT: 'claude-sonnet-4-20250514',
	// Groq (primary) - verified March 10, 2026
	GATEKEEPER_FALLBACK: 'meta-llama/llama-4-scout-17b-16e-instruct',
	GENERATOR_FALLBACK: 'openai/gpt-oss-120b',

	// OpenRouter (fallback) - verified March 10, 2026
	GATEKEEPER: 'qwen/qwen3-next-80b-instruct',
	GENERATOR: 'meta-llama/llama-4-maverick',

	// OpenAI for embeddings
	EMBEDDINGS: 'text-embedding-3-small',
	// Pinecone for reranking
	RERANKER: 'bge-reranker-v2-m3',
};

export const CONFIG = {
	TOP_K: 12,
	TOP_N: 5,
	MIN_RERANK_SCORE: 0.25,
	EMBEDDING_DIMENSIONS: 1536,
};

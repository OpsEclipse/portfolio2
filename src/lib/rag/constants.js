export const NAMESPACES = {
	PERSONAL: 'personal_life',
	PROFESSIONAL: 'professional_life',
	ABOUT_RAG: 'about_rag',
};

export const MODELS = {
	// Groq (primary) - Using the current verified production IDs
	GATEKEEPER_FALLBACK: 'meta-llama/llama-4-scout-17b-16e-instruct',
	GENERATOR_FALLBACK:
		'meta-llama/llama-4-maverick-17b-128e-instruct',

	// OpenRouter (fallback) - Updated to the current stable Qwen/Llama IDs
	// Note: ":free" suffix is only for the specific free-tier endpoints
	GATEKEEPER: 'qwen/qwen3-next-80b-instruct',
	GENERATOR: 'meta-llama/llama-4-maverick-instruct',

	// OpenAI for embeddings
	EMBEDDINGS: 'text-embedding-3-small',
	// Pinecone for reranking
	RERANKER: 'bge-reranker-v2-m3',
};

export const CONFIG = {
	TOP_K: 10,
	TOP_N: 3,
	MIN_RERANK_SCORE: 0.45,
	EMBEDDING_DIMENSIONS: 1536,
};

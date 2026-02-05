# Portfolio RAG Architecture Specification

This document reflects the current codebase implementation of the portfolio RAG pipeline in **Next.js** with **Pinecone** retrieval/reranking, **OpenAI embeddings**, and **Groq/OpenRouter** for generation.

---

## 🛠️ System Architecture (Actual Flow)

The pipeline is optimized for scoped retrieval, relevance filtering, and low-latency streaming.

### 1. Request Intake & Rate Limiting
The chat request hits `app/api/chat/route.js` (App Router). A simple in-memory rate limiter allows **20 requests per minute per client**.

### 2. Gatekeeper & Intent Classification
A Gatekeeper LLM classifies the query and determines **which namespaces to search** (or to skip RAG entirely), and rewrites the query for retrieval:
* **Namespaces:** `personal_life`, `professional_life`, `about_rag`
* **Coverage bias:** ambiguous queries can return multiple namespaces.
* **Primary model:** Groq Llama (fallback to OpenRouter).

### 3. Embedding & Retrieval
* **Embeddings:** OpenAI `text-embedding-3-small`
* **Vector DB:** Pinecone index `PINECONE_INDEX` (default `portfolio-rag`)
* **Top K:** `12` per namespace
* **Metadata:** `includeMetadata: true`
* Results across namespaces are **merged and sorted by score**.

### 4. Reranking & Filtering
* **Reranker:** Pinecone Inference `bge-reranker-v2-m3`
* **Top N:** `5`
* **Relevance threshold:** minimum rerank score `0.4`
* If rerank fails, top-N by original score is used as fallback.

### 5. Prompt Construction
* The system prompt injects context snippets with metadata.
* Each snippet includes **heading** and **chunk_id** for traceability.
* If no relevant context is found, a fallback context block is used.

### 6. Generation & Streaming
* **Primary LLM:** Groq `meta-llama/llama-4-maverick-17b-128e-instruct`
* **Fallback LLM:** OpenRouter `meta-llama/llama-4-maverick-instruct`
* **Streaming:** Manual SSE (`data: {content: ...}`) from the route handler.

### 7. Source Attribution (Used Sources)
The model is instructed to append a hidden block:
```
<<USED_SOURCES>>
chunk_id_1
chunk_id_2
<</USED_SOURCES>>
```
The server strips this from the stream, maps chunk IDs back to documents, and appends a visible `<<SOURCES>>` block. The UI renders these as source links with:
* `doc_title`
* `heading`
* optional `source_url`

---

## 💻 Technical Details (Code Reference)

Key modules and responsibilities:
* `app/api/chat/route.js`: Request handling, rate limiting, streaming, used-source parsing.
* `src/lib/rag/gatekeeper.js`: Namespace classification + query refinement.
* `src/lib/rag/retrieval.js`: OpenAI embeddings + Pinecone search.
* `src/lib/rag/reranker.js`: Pinecone inference reranking + relevance filter.
* `src/lib/prompts.js`: System prompt templates + context formatting.
* `src/lib/rag/constants.js`: Model IDs and RAG config values.

---

## ⚙️ Configuration

Environment variables:
* `PINECONE_API_KEY`
* `PINECONE_INDEX` (default: `portfolio-rag`)
* `OPENAI_API_KEY`
* `GROQ_API_KEY`
* `OPENROUTER_API_KEY`

RAG tuning (from `src/lib/rag/constants.js`):
* `TOP_K`: 12
* `TOP_N`: 5
* `MIN_RERANK_SCORE`: 0.4
* `EMBEDDINGS`: `text-embedding-3-small`
* `RERANKER`: `bge-reranker-v2-m3`

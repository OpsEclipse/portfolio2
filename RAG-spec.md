# Pinecone RAG Architecture Specification

This document outlines the technical implementation for a multi-stage Retrieval-Augmented Generation (RAG) pipeline built with **Next.js**, **Pinecone**, and the **Vercel AI SDK**.

---

## 🛠️ System Architecture

The pipeline follows a high-precision flow designed to reduce noise and improve the relevance of retrieved context through intent classification and re-ranking.

### 1. Gatekeeper & Intent Layer
The initial request enters via a **Next.js Serverless Route**. Before querying the database, a "Gatekeeper" LLM processes the input:
* **Query Rewriting:** Normalizes "not chill" (ambiguous) queries into optimized search terms.
* **Metadata Extraction:** Identifies the user's intent to apply a `namespace` or `metadata filter`, ensuring retrieval is **Scoped**.

### 2. Retrieval Stage (Scoped Retrieval)
* **Embedding:** The refined query is vectorized using the `OpenAI embedding` model (e.g., `text-embedding-3-small`).
* **Semantic Search:** Queries Pinecone using the vector + the extracted metadata filters.
* **Top X Chunks:** Initial retrieval of a broader set of results (e.g., 10-20 chunks) to ensure high recall.

### 3. Precision Stage (Re-ranking)
* **Pinecone Reranker:** The **Top X** chunks are passed through a Cross-Encoder model.
* **Top N Chunks:** The results are re-ordered by actual relevance to the query. Only the top $N$ (e.g., 3-5) most relevant chunks are kept, significantly increasing the signal-to-noise ratio for the final LLM.

### 4. Generation Layer
* **Free LLM:** The reranked context is injected into a prompt for a cost-efficient model (e.g., GPT-4o-mini).
* **Streamed Markdown:** The response is streamed back to the client via **Vercel AI SDK** for a real-time UI experience.

---

## 💻 Technical Specifications

### Implementation Blueprint (`/api/chat/route.ts`)

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuery = messages[messages.length - 1].content;

  // 1. GATEKEEPER: Intent Extraction
  // Logic to determine 'namespace' and 'rewrittenQuery'
  const namespace = "internal_docs"; 
  const refinedQuery = userQuery; 

  // 2. EMBEDDING
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: refinedQuery,
  });

  // 3. SCOPED RETRIEVAL (Top X)
  const index = pc.Index(process.env.PINECONE_INDEX!);
  const searchResults = await index.namespace(namespace).query({
    vector: embedding,
    topK: 15,
    includeMetadata: true,
  });

  // 4. PRECISION (Reranking to Top N)
  // Utilizing Pinecone Inference for Reranking
  const documents = searchResults.matches.map(m => m.metadata?.text as string);
  const reranked = await pc.inference.rerank({
    model: "bge-reranker-v2-m3",
    query: refinedQuery,
    documents: documents,
    topN: 5,
  });

  const finalContext = reranked.data.map(d => d.document.text).join("\n");

  // 5. GENERATION
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a precise assistant. Context: ${finalContext}`,
    messages,
  });

  return result.toDataStreamResponse();
}
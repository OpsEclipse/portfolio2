# Sonnet Tool-Based RAG Chat Design

Date: 2026-04-10

## Goal

Replace the current multi-provider chat generation path with Vercel AI SDK and Anthropic Sonnet 4.6.

The new route should behave like an agent [a model that can choose when to use helper functions], not a fixed pipeline. Sonnet should decide when to call a single portfolio retrieval tool. The retrieval tool should keep using the current Pinecone search, embeddings, and reranking flow.

## Scope

In scope:

- Replace the current generation flow in `app/api/chat/route.js`
- Remove the gatekeeper from the runtime chat path
- Add a single `searchPortfolioContext` tool for Sonnet
- Keep the current chat UI request shape and streamed response behavior
- Keep existing Pinecone retrieval and reranking logic as the backend for the tool
- Keep current source formatting so the frontend does not need a large rewrite

Out of scope:

- Rebuilding the frontend chat UI
- Re-indexing Pinecone data
- Changing embeddings or reranker providers
- Rewriting unrelated LLM helper code outside the chat path unless cleanup is needed for build health

## Current State

Today the route does this:

1. Rate limit the request
2. Detect greeting mode from the incoming payload
3. Run a gatekeeper model to choose namespaces and rewrite the query
4. Retrieve and rerank Pinecone matches
5. Build a system prompt with context
6. Stream the final answer from Groq with OpenRouter fallback
7. Parse `USED_SOURCES` markers and append human-readable source links

This works, but it splits reasoning across multiple models and makes the request path harder to evolve.

## Proposed Architecture

The new route uses Vercel AI SDK `streamText` with Anthropic Sonnet 4.6 as the only generation model.

The route still handles:

- rate limiting
- request validation
- greeting detection
- system prompt creation
- source extraction and frontend response formatting

Sonnet receives:

- the full conversation messages, not only the latest user turn
- the chosen system prompt
- one tool named `searchPortfolioContext`

Sonnet decides whether to answer directly or call the retrieval tool first.

This keeps the route simple. It also keeps retrieval quality inside app code instead of pushing ranking logic into the model.

## Tool Design

### Tool Name

`searchPortfolioContext`

### Tool Input

- `query`: string, required
- `focus`: optional enum with `personal_life`, `professional_life`, `about_rag`, or `all`

`focus` is only a hint. If Sonnet omits it, the tool searches all namespaces.

### Tool Output

- `context`: compact merged text from the best matching documents
- `sources`: array of source records with chunk id, title, heading, namespace, source URL, and short snippet
- `usedNamespaces`: array of namespaces actually searched

The tool output should be compact and readable. It should give Sonnet enough evidence to answer without flooding the prompt with raw document text.

## Retrieval Flow

When Sonnet calls `searchPortfolioContext`, the app should:

1. Resolve the namespaces from `focus`
2. Embed the provided query
3. Query Pinecone across the chosen namespaces
4. Sort initial results by vector score
5. Rerank the retrieved documents
6. Filter to the most relevant matches
7. Return a compact evidence packet to the model

The route should reuse the current retrieval helpers where possible instead of creating a second search system.

## Prompting Rules

The base prompt structure should stay close to the current prompts in `src/lib/prompts.js`.

Key rule changes:

- Remove gatekeeper-specific assumptions
- Instruct Sonnet to call `searchPortfolioContext` for questions about Sparsh, his projects, skills, background, contact info, or how the site works unless the answer is already obvious from conversation context
- Keep the current contact-info safety rule: only answer from retrieved context for contact or personal identifier requests
- Keep the current `USED_SOURCES` block requirement so the route can preserve source rendering

Greeting behavior should stay separate. Greeting requests should continue using the short greeting prompt and should not require tool usage unless the prompt later needs live portfolio context.

## API and Streaming Behavior

The frontend should keep posting the same payload shape to `app/api/chat/route.js`.

The backend should pass the full message history through to Sonnet. This is a behavior improvement over the current route, which only forwards the latest user message during generation.

The backend should keep streaming `data: {"content":"..."}` chunks so `src/components/ChatWindow.jsx` does not need a protocol rewrite.

The route should still:

- parse the final `USED_SOURCES` block
- map used chunk ids back to retrieved docs
- append the formatted `<<SOURCES>>` block used by the current UI

This preserves the existing client contract while changing the model runtime under the hood.

## Error Handling

If tool execution fails:

- log the failure server-side
- return an empty tool result with a short failure note
- allow Sonnet to continue and answer conservatively

If embeddings, Pinecone search, or reranking fail:

- fail open to the best available step
- if reranking fails, use top vector matches
- if retrieval fails entirely, let Sonnet answer without retrieved context and avoid fabricated specifics

If Sonnet omits the `USED_SOURCES` block:

- the route should fail safely and return the answer without formatted source links rather than breaking the stream

## File-Level Changes

Expected files:

- `app/api/chat/route.js`: replace current generation loop with Vercel AI SDK `streamText`, register the retrieval tool, preserve streaming output contract
- `src/lib/rag/gatekeeper.js`: remove from chat runtime path; keep or delete based on whether anything else imports it
- `src/lib/rag/retrieval.js`: likely reuse as-is, with a small helper if tool output shaping needs it
- `src/lib/prompts.js`: update prompt wording for tool-based retrieval and keep source rules
- `package.json`: add the Anthropic provider package if missing and remove unused runtime packages only if safe
- `.env.local` usage: move final generation to Anthropic credentials expected by the Vercel AI SDK path

## Testing Strategy

Write tests before production changes.

Minimum coverage:

1. Route test for direct-answer behavior when Sonnet does not call the tool
2. Route test for tool-call behavior when Sonnet retrieves portfolio context
3. Route test that preserves the current streamed content format
4. Route test that `USED_SOURCES` becomes frontend `<<SOURCES>>`
5. Route test for tool failure fallback
6. Route test for rate limiting remaining intact

Mock external services in route tests:

- Anthropic model responses
- embeddings
- Pinecone retrieval
- reranking

## Risks and Mitigations

Risk: Sonnet may skip retrieval when it should search.

Mitigation: make the system prompt explicit about when retrieval is expected, especially for portfolio facts and contact info.

Risk: Tool responses may be too large and increase latency [delay before output starts].

Mitigation: return compact snippets and a small number of top documents.

Risk: Source mapping could break if tool output and final text drift apart.

Mitigation: keep chunk ids in tool output and preserve the existing `USED_SOURCES` parsing flow in the route.

## Decision Summary

Approved decisions:

- Remove the gatekeeper from the runtime chat path
- Use Sonnet 4.6 as the main chat model through Vercel AI SDK
- Expose one retrieval tool
- Let Sonnet choose when to call the tool
- Keep the current Pinecone retrieval and reranking logic behind that tool
- Keep the current frontend streaming and source-formatting contract stable

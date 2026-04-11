# Vercel AI SDK Sonnet Retrieval Tool Design

## Summary

Replace the current chat generation stack in the portfolio chat route with Vercel AI SDK and Anthropic Sonnet 4.6.

Remove the gatekeeper LLM [large language model] from the request path.

Keep the current retrieval pipeline in app code:

- OpenAI embeddings
- Pinecone vector search
- Pinecone reranking [re-ordering search results so the strongest evidence comes first]

Expose that retrieval pipeline to Sonnet through a single tool call [an app-defined function the model can ask the server to run].

Sonnet becomes the only chat model in the route. It decides when retrieval is needed.

## Goals

- Switch the chat route to Vercel AI SDK streaming
- Use Anthropic Sonnet 4.6 as the main chat model
- Remove the current Groq and OpenRouter generation path
- Remove the gatekeeper classifier path from runtime usage
- Let Sonnet choose when to fetch portfolio context through one retrieval tool
- Preserve the current chat UI contract so the frontend does not need a large rewrite

## Non-Goals

- Rebuild the chat UI
- Replace Pinecone
- Replace the current embedding model
- Add multiple tools or a full multi-tool agent system
- Redesign the source display format in the client

## Architecture

The main route stays in [app/api/chat/route.js](/Users/sparshah/Documents/projects/frontend/portfolio2/app/api/chat/route.js).

That route will move from manual provider streaming to `streamText` [a Vercel AI SDK helper that streams model output as it is generated].

The route will:

- validate the request
- keep rate limiting
- build the system prompt
- call Sonnet through Vercel AI SDK
- register one retrieval tool named `searchPortfolioContext`
- stream the final answer back to the existing client

The retrieval logic stays in focused helpers under [src/lib/rag](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/rag).

## Tool Contract

Tool name:

- `searchPortfolioContext`

Input:

- `query`: string
- `focus`: optional enum with `personal_life`, `professional_life`, `about_rag`, or `all`

The optional `focus` value lets Sonnet narrow the search when it knows the topic.

Output:

- `context`: a compact merged evidence block
- `sources`: an array of source records with ids, namespace, title, and snippet text
- `usedNamespaces`: the namespaces that were searched

The tool should return a compact evidence packet rather than raw Pinecone matches.

## Data Flow

1. The client sends chat messages to the route.
2. The route reads the latest user message and builds the system prompt.
3. The route starts `streamText` with Sonnet 4.6 and the retrieval tool.
4. Sonnet decides whether the question needs portfolio evidence.
5. If yes, Sonnet calls `searchPortfolioContext`.
6. The tool embeds the query and searches Pinecone.
7. The tool reranks the results and builds a compact evidence block.
8. Sonnet uses that evidence to finish the answer.
9. The route formats sources into the existing response shape and streams the answer back to the client.

## Retrieval Behavior

The tool will reuse the current retrieval helpers as much as possible.

Expected behavior:

- `focus=all` searches all current namespaces
- a specific focus searches only that namespace
- empty search results return an empty context block and empty sources array
- source ids remain stable so the existing source rendering can keep working

This keeps search quality in server code instead of pushing search behavior fully into the model.

## Error Handling

- Keep the current request validation and rate limiting behavior
- If the tool fails, the route should not crash the stream
- If retrieval fails, Sonnet should continue and answer with limited confidence instead of hanging
- If source parsing fails, the client should still receive plain answer text
- If Anthropic credentials are missing, fail fast with a server error instead of silently falling back to another provider

## File Changes

Primary files:

- [app/api/chat/route.js](/Users/sparshah/Documents/projects/frontend/portfolio2/app/api/chat/route.js)
- [src/lib/prompts.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/prompts.js)
- [src/lib/rag/retrieval.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/rag/retrieval.js)
- [src/lib/rag/reranker.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/rag/reranker.js)
- [src/lib/rag/constants.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/rag/constants.js)

Likely new helper:

- `src/lib/ai/searchPortfolioContext.js` or a similar focused helper for the tool wrapper

Likely deprecated runtime helpers:

- [src/lib/groq.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/groq.js)
- [src/lib/openrouter.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/openrouter.js)
- [src/lib/rag/gatekeeper.js](/Users/sparshah/Documents/projects/frontend/portfolio2/src/lib/rag/gatekeeper.js)

Those files can stay in the repo until cleanup is verified, but they should be removed from the active request path.

## Dependencies And Config

Use Vercel AI SDK with Anthropic support.

Expected dependency shape:

- keep `ai`
- add `@ai-sdk/anthropic`
- remove `@ai-sdk/openai` only if it is not used anywhere else

Expected environment variables:

- `ANTHROPIC_API_KEY` for Sonnet
- `OPENAI_API_KEY` for embeddings
- `PINECONE_API_KEY`
- `PINECONE_INDEX`

The old `GROQ_API_KEY` and `OPENROUTER_API_KEY` should no longer be required once the route is migrated.

## Testing

Follow TDD [test-driven development, where we write the failing test before the implementation].

Test targets:

- the retrieval tool input and output behavior
- namespace selection when `focus` is provided or omitted
- route behavior when Sonnet answers without calling the tool
- route behavior when Sonnet calls the tool
- route behavior when retrieval fails
- source formatting compatibility with the current client

At minimum, verify the route still streams correctly and the existing chat UI still renders messages and sources.

## Open Decision Already Resolved

The user chose this behavior:

- no gatekeeper
- Sonnet decides when to call retrieval
- one retrieval tool only

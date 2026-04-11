# Friendly Tool Status Streaming Design

Date: 2026-04-11

## Goal

Show clear tool activity in the chat when the assistant uses retrieval.

The current UI shows `Thinking...` while the backend works. That hides what actually happened. The new behavior should show a friendly status label when the retrieval tool runs, and that label should stay visible with the final assistant message.

## Decision Summary

Approved decisions:

- Use a friendly label instead of raw tool names
- Only show a status when a real tool call happens
- Keep the status visible after the answer finishes
- Do not mix the status text into the assistant answer body
- Keep the existing `data: [DONE]` stream ending

## Current State

Today the backend streams only text chunks through SSE [Server-Sent Events, a one-way live stream from the server to the browser].

The frontend creates an empty assistant message while streaming and shows `Thinking...` when that message has no content yet.

This has two problems:

- users cannot tell whether the assistant actually used retrieval
- the loading text is generic, not tied to real tool activity

## Proposed Behavior

When the assistant calls `searchPortfolioContext`, the server should emit a structured status event with a friendly label:

`Retrieved from the knowledge layer`

That status should be attached to the same assistant message that receives the streamed answer text.

The label should persist after the answer finishes. It becomes a small activity record, not a temporary spinner.

If no tool runs, no status should appear.

## Stream Contract

Keep SSE as the transport.

Add typed JSON events inside the existing `data:` lines:

- `{ "type": "content", "content": "..." }`
- `{ "type": "status", "label": "Retrieved from the knowledge layer" }`

Keep the existing end marker:

- `data: [DONE]`

Rules:

- Direct answers emit only `content` events
- Tool-backed answers emit one `status` event when retrieval starts
- The status event is separate from the final answer text
- Existing source formatting stays unchanged

This keeps the stream simple. It also gives the frontend room to show real activity without parsing special text out of the answer.

## Backend Design

### `src/lib/chat/runSonnetAgent.js`

Add a way to report tool activity from inside the retrieval tool execution path.

The tool wrapper already knows when `searchPortfolioContext` starts. That is the right place to trigger a status signal.

The returned object should include:

- `textStream`
- `toolDocs`
- `statusStream` or an equivalent event channel [a path for sending structured updates alongside the text stream]

The tool should emit one friendly status event before retrieval work begins.

### `src/lib/chat/postHandler.js`

Extend the SSE writer so it can send typed events instead of only raw text payloads.

Responsibilities:

- forward tool status events as `{ type: 'status', label: ... }`
- forward text chunks as `{ type: 'content', content: ... }`
- preserve `USED_SOURCES` parsing and final `<<SOURCES>>` formatting
- preserve current error handling and `[DONE]` behavior

The server should not send a `status-clear` event. The user wants the retrieval record to remain visible.

## Frontend Design

### `src/components/ChatWindow.jsx`

Update client stream parsing so it understands typed events.

Assistant messages should carry both:

- `content`
- `statusLabel` as message metadata [extra structured data attached to a message]

When a `status` event arrives:

- ensure there is an in-flight assistant message
- attach `statusLabel` to that message

When a `content` event arrives:

- append text to that same assistant message

If a direct answer starts without a prior `status` event:

- keep the current assistant message flow, but do not show any status line

Remove the generic `Thinking...` display for assistant replies. We only want visible activity when there is a real tool event.

### `src/components/ChatMessage.jsx`

Render a compact status line above the assistant answer when `statusLabel` exists.

The status line should be clearly secondary to the answer body. It should read like a completed action, not like a warning or an error.

## Presentation

Use calm, friendly copy:

`Retrieved from the knowledge layer`

This wording fits the persistent behavior better than present-tense text like `Retrieving...`.

The label should look like a small system note, not part of the assistant prose.

## Testing Strategy

Follow TDD [test-driven development, where we write the failing test before the implementation].

Minimum coverage:

1. `postHandler` test that direct answers emit only `content` events and `[DONE]`
2. `postHandler` test that tool-backed answers emit a `status` event before answer content
3. `postHandler` test that source formatting still appears after tool-backed answers
4. frontend stream-handling test, if practical, that a `status` event attaches `statusLabel` to the in-flight assistant message
5. frontend behavior check that no status appears for direct answers

## Risks And Mitigations

Risk: the status event could create a second blank assistant row.

Mitigation: the frontend should always reuse the current in-flight assistant message for both status and content.

Risk: stream chunks may arrive split across reads.

Mitigation: keep the existing tolerant line parsing and only act on complete `data:` entries.

Risk: future tools may need different labels.

Mitigation: keep the event typed and structured now, so later labels can vary without changing the stream shape again.

## Out Of Scope

- showing raw tool names
- a larger event protocol for every internal agent step
- redesigning source cards
- changing the underlying retrieval pipeline

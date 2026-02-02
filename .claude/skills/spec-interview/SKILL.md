---
name: spec-interview
description: Structured interview process to clarify ambiguities before generating a project or feature spec.
user-invocable: true
---

# Spec Interview

When invoked, conduct a structured interview to gather requirements before writing a specification. Ask questions in batches of 2-3 to avoid overwhelming the user.

## Interview Flow

### 1. Core Purpose (Start Here)

- What problem does this feature/project solve?
- Who is the target user?
- What does success look like?

### 2. Scope Boundaries

- What is explicitly **in scope** for v1?
- What is explicitly **out of scope** (for now)?
- Are there existing features this interacts with?

### 3. User Experience

- What triggers this feature (user action, automatic, scheduled)?
- What is the expected user flow (step by step)?
- What feedback does the user receive (loading states, success, errors)?
- Mobile considerations?

### 4. Data & State

- What data is needed? Where does it come from?
- What needs to persist vs. what is ephemeral?
- Caching requirements?
- Privacy/security considerations?

### 5. Technical Constraints

- Must integrate with existing systems? (APIs, auth, database)
- Performance requirements? (load time, refresh frequency)
- Offline support needed?
- Third-party dependencies?

### 6. Edge Cases

- What happens when data is empty/missing?
- Error handling strategy?
- Rate limits or quotas to consider?
- What if the user does something unexpected?

### 7. Design & Polish

- Reference any existing UI patterns to follow?
- Animations/transitions needed?
- Accessibility requirements?

## Question Strategy

**Do:**
- Ask clarifying follow-ups when answers are vague
- Offer concrete options when the user seems unsure
- Surface hidden assumptions ("Are you assuming X?")
- Summarize understanding before moving to next section

**Don't:**
- Ask all questions at once
- Assume technical knowledge level
- Skip sections - even "N/A" is valuable information

## Output Format

After the interview, generate a spec document with:

```markdown
# [Feature Name] Specification

## Overview
One paragraph summary of purpose and value.

## User Stories
- As a [user], I want [action] so that [benefit]

## Scope
### In Scope (v1)
- Bullet list

### Out of Scope
- Bullet list

## User Flow
1. Step-by-step flow

## Technical Design
### Data Model
### API/Integration Points
### State Management

## UI/UX Requirements
- Components needed
- Interactions and animations
- Responsive behavior

## Edge Cases & Error Handling
| Scenario | Behavior |
|----------|----------|
| ... | ... |

## Open Questions
- Any unresolved items for follow-up

## Acceptance Criteria
- [ ] Testable criteria for completion
```

## Example Interview Start

> "I'd like to understand what you're building before we write the spec. Let's start with the basics:
>
> 1. What problem does this feature solve?
> 2. Who will use it?
> 3. Can you describe the ideal user experience in a sentence or two?"

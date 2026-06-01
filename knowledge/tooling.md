# Tooling rules

## Codegraph
- After scaffolding a project, run `codegraph init -i`.
- Use `codegraph search` / the codegraph MCP to locate symbols, callers, callees, and trace flows **before** editing. It's a prebuilt index — don't run grep+read loops or delegate exploration when codegraph answers.
- Re-index lags writes by ~1s; consult it before writing, not during.

## Context7 (docs)
- For ANY library / framework / SDK / API / CLI / cloud-service question — even well-known ones (React, Expo, Firebase, Quarkus, Tailwind, axios, TanStack Query, NativeWind, Gluestack) — fetch current docs with Context7. Training data may be stale.
- Flow: `resolve-library-id` (pick best match by name/score/snippets) → `query-docs` with the full question. Prefer over web search for library docs.
- Don't use it for refactoring, business-logic debugging, or general concepts.

## Figma MCP (design-to-code)
- Pull tokens + frames; map them to the project's styling system (Tailwind tokens / NativeWind).
- `get_metadata` to find node IDs (huge dumps → query/grep the saved file), `get_design_context` per specific frame, `get_screenshot` per frame, `get_variable_defs` for tokens.
- Rate-limited on the Starter plan — pull a few frames at a time; cache what you extract.

## AskUserQuestion
- Use only for genuine decisions that change what you build and can't be inferred from the request/code/sensible defaults.
- Put the recommended option first, labeled "(Recommended)"; keep options mutually exclusive (or `multiSelect`).
- Don't use it to ask "should I proceed?" — pick the default, state it, move on.

## Task tracking
- For multi-step work, keep a task list (one task per phase). Mark `in_progress` when starting, `completed` when its gates pass.

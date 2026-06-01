# Module — AI / LLM provider (extension point)

> **Stub.** Not present in the source projects; included as an optional module. Pluggable LLM client for chat/completion/embeddings on Quarkus. Confirm the chosen SDK's API via Context7 before building.

## When to pick
AI features: summaries, classification, semantic search, chat. Advanced backend preset.

## Options
- **Quarkus LangChain4j** (`io.quarkiverse.langchain4j:quarkus-langchain4j-openai` / `-ollama` / etc.) — declarative `@RegisterAiService` interfaces, the idiomatic Quarkus path.
- **Direct provider SDK** (Anthropic / OpenAI) behind a hexagonal port.
- **Vercel AI Gateway / AI SDK** if the frontend owns the AI calls instead.

## Hexagonal placement
Keep it behind a domain port so the provider is swappable:
- `domain/repository/<Ai>Port.java` — interface (`summarize(text): String`, `embed(text): float[]`, …).
- `infrastructure/ai/<Provider>Adapter.java` — the actual SDK call, `@ApplicationScoped`.
- Use cases depend on the port, never the SDK. Stream responses where the UX benefits.

## Security + ops (non-negotiable)
- **Provider API key in Secret Manager / `--set-secrets`**, never the repo or image (see `../../../knowledge/deploy-gcp.md`).
- Rate-limit + budget-cap calls; handle provider 429/5xx with retry/backoff.
- Log prompts/responses carefully — scrub PII; don't log secrets.

## Verification gate
- Unit-test use cases with the port **mocked** (no real API calls in `./mvnw test`).
- One integration/manual smoke test against the real provider, gated behind an env flag so CI doesn't spend tokens.

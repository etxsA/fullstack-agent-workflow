# Module — AI / LLM provider

Pluggable LLM client behind a domain port. **Distilled from real source:** back-plaguie's `GeminiPlagaPredictionProvider` + `GeminiHttpClient` (a Gemini-backed pest-prediction provider). Confirm provider API shapes via Context7 before building.

## When to pick
AI features (predictions, summaries, classification, semantic search). Advanced backend preset.

## Hexagonal shape (the real pattern)
Keep the provider swappable and the use cases SDK-free:
```
domain/repository/<X>Provider.java          # the PORT — interface + a nested result type
infrastructure/<provider>/<Provider>Impl.java  # ADAPTER implements the port, @ApplicationScoped
infrastructure/<provider>/<Provider>HttpClient.java  # thin HTTP wrapper (mockable)
```
- The **port** declares the domain call + an inner result class (e.g. `PrediccionResult { resumen, items, recomendaciones }`) — no framework types leak.
- The **adapter** builds the prompt, calls the HTTP client, parses JSON → domain objects.
- Use cases depend on the port only.

## HTTP client (no SDK dependency needed)
Plain JDK `java.net.http.HttpClient` is enough:
```java
@ApplicationScoped
public class GeminiHttpClient {
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10)).build();

    public String generateContent(String endpoint, String body, int timeoutSeconds)
            throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(endpoint))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(timeoutSeconds))
            .POST(HttpRequest.BodyPublishers.ofString(body, UTF_8)).build();
        HttpResponse<String> res = http.send(req, BodyHandlers.ofString(UTF_8));
        if (res.statusCode() < 200 || res.statusCode() >= 300)
            throw new IOException("Provider " + res.statusCode() + ": " + res.body());
        return res.body();
    }
}
```
Build the request body + parse the response with the injected Jackson `ObjectMapper` (`createObjectNode`/`readTree`). Set `generationConfig.responseMimeType = "application/json"` and **strip ``` code fences** the model may wrap around the JSON.

## Config (`@ConfigProperty`, not hardcoded)
```properties
gemini.api.base-url=https://generativelanguage.googleapis.com
gemini.api.key=${GEMINI_API_KEY:}        # empty default → graceful fallback
gemini.api.model=gemini-1.5-flash
gemini.api.timeout-seconds=30
```
Endpoint: `base-url + "/v1beta/models/" + URLEncoder.encode(model) + ":generateContent?key=" + URLEncoder.encode(key)`.

## Critical real-world patterns
- **Graceful degradation (the key lesson):** if the API key is blank → return a **deterministic heuristic fallback** instead of failing; on ANY provider error/parse failure → fall back too. The feature never hard-crashes on a missing key or a flaky provider. (back-plaguie: `fallbackHeuristic(...)` derived from local historical data.)
- **Key in Secret Manager / `--set-secrets`**, never the repo or image (`../../../knowledge/deploy-gcp.md`). The blank-default config makes local/dev/test run without a key.
- Rate-limit + budget-cap; handle 429/5xx with backoff. Scrub PII from logged prompts.

## Verification gate
- Unit-test the provider with the **HTTP client mocked** (assert prompt building + JSON parsing + the fallback path). No real API calls in `./mvnw test`.
- One env-flagged integration smoke test against the real provider so CI doesn't spend tokens.

---
name: add-feature
description: Add a full-stack or single-layer feature to a workflow project, following the canonical patterns — backend's 8-step hexagonal flow, frontend's screen->hook->service->http chain — plus the matching tests, as one phase + PR. Trigger: /add-feature, "add a feature", "implement the X module/screen".
---

# add-feature — one feature, one phase, one PR

Add a feature without breaking the conventions. Branch first (`feature/<name>` off `develop`), build, gate via `verify-phase`, then the agent creates + merges the PR.

## Backend — the canonical 8-step hexagonal flow
Build in dependency order (`knowledge/conventions.md`). Example: a `Widget` feature.
1. **Domain model** `domain/models/Widget.java` — plain POJO; relations by id (`ownerId: UUID`), enums as String, no inverse collections.
2. **Domain repo interface** `domain/repository/WidgetRepository.java` — signatures only, return domain models / `Optional`. Name methods to avoid Panache clashes (`findAllWidgets()`, not `findAll()`).
3. **JPA entity** `infrastructure/persistence/entity/widget/WidgetEntity.java` — `@Entity` (+`@NamedEntityGraph` in advanced for N+1).
4. **Static mapper** `infrastructure/mapper/WidgetMapper.java` — `toDomain`/`toEntity`, no null-checks, FK stubs (id-only, no cascade).
5. **Panache repo impl** `infrastructure/persistence/repository/WidgetRepositoryImpl.java` — implements the interface + `PanacheRepositoryBase`; `@Transactional` on writes; `em.merge()` with full-field stubs; `findByIds` bulk for lists.
6. **DTO** `application/dto/WidgetDto.java` — Bean Validation (`@NotBlank`/`@Size`/`@NotNull` for create; relaxed for PATCH); ctor that takes domain model(s).
7. **Use case** `application/usecase/widget/<Action>WidgetUseCase.java` — one per file, `@ApplicationScoped`; no input/auth validation (DTO + filter do it); throws `NotFoundException`/`ForbiddenException`; returns DTOs.
8. **Resource** `interfaces/rest/WidgetResource.java` — singular path, `@Valid` on bodies, `@Min` on params; status codes (POST→201, DELETE returns the deleted DTO); OpenAPI annotations (mandatory in advanced).

**Tests:** unit (`@ExtendWith(MockitoExtension.class)`) per use case + integration (`@QuarkusTest` + `H2TestProfile`, Firebase mocked) per resource. Honor the cross-test cleanup rule (`stacks/backend-quarkus/modules/testing-native.md`).

## Frontend — the screen → hook → service → http chain
1. **Types** in `src/types/api.ts` (request DTO vs response separate; nullable fields optional — JSON-B omits nulls).
2. **Service** `src/services/<x>.service.ts` — typed function, imports `@/lib/http` only. No `any`.
3. **Query hook** `src/hooks/use<X>.ts` — TanStack Query wrapping the service; keys from the `queryKeys` factory; mutations invalidate the right keys (optimistic + rollback where it helps).
4. **Screen / component** — consumes the hook. **Never call http directly.** Render loading/error/empty/content; `testID`s by intent (`btn-`,`input-`,`card-`).
5. **Tests:** service (mock axios), hook (mock service), a render/integration test of the screen.

## Honor the backend gotchas (`knowledge/gotchas.md`)
PATCH may be full-replace (send every field) · no ownership checks (filter to own data client-side) · case-sensitive enums (zod-validate) · pagination shape `{items,count,hasMore}` 1-indexed.

Gate with `verify-phase` (incl. the live API smoke test), then agent merges the PR.

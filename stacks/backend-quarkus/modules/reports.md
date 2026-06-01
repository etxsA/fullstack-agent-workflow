# Module — Report export (XLSX / PDF)

> **Distillable from real source** (currently a sketch). The `back-plaguie` project has a real `ReporteExporter` (Apache POI / PDFBox) — read that Java file to upgrade this preset from sketch to a full, code-backed module. Generate downloadable spreadsheets/documents on Quarkus. Confirm POI/PDFBox APIs via Context7 before building.

## When to pick
Users need downloadable reports (orders, inventory, summaries). Advanced backend preset.

## Deps
```xml
<!-- XLSX -->
<dependency><groupId>org.apache.poi</groupId><artifactId>poi-ooxml</artifactId></dependency>
<!-- PDF -->
<dependency><groupId>org.apache.pdfbox</groupId><artifactId>pdfbox</artifactId></dependency>
```

## Patterns
- **Stream the output**, don't buffer whole files in memory for large exports. Return via JAX-RS `StreamingOutput` with the right `Content-Type` (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` / `application/pdf`) + `Content-Disposition: attachment; filename=...`.
- **Explicit column order** — don't rely on map iteration order; define columns once.
- **Bundle fonts** for PDFBox (default fonts are limited; embed what you render).
- Hexagonal placement: a `ReportGenerator` port in `domain`, POI/PDFBox adapter in `infrastructure/report/`. Use cases assemble the data, the adapter renders bytes.

## Verification gate
- Unit-test the row/column assembly (data → model) with the renderer mocked.
- One integration test that generates a small file and asserts it opens / has the expected sheet names / page count.
- Manual: hit the endpoint, open the downloaded file.

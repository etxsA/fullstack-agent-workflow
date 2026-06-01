# Module — Report export (XLSX / PDF)

Generate downloadable XLSX/PDF on Quarkus. **Distilled from real source:** back-plaguie's `ReportePredictivoExporter` (port) + `ReportePredictivoExporterImpl` (Apache POI + PDFBox) + `ReportePredictivoPlagaResource` (download endpoints). Confirm POI/PDFBox APIs via Context7 before building.

## When to pick
Users need downloadable reports (predictions, orders, inventory). Advanced backend preset.

## Deps
```xml
<dependency><groupId>org.apache.poi</groupId><artifactId>poi-ooxml</artifactId></dependency>   <!-- XLSX -->
<dependency><groupId>org.apache.pdfbox</groupId><artifactId>pdfbox</artifactId></dependency>   <!-- PDF -->
```

## Hexagonal shape (the real pattern)
```java
// domain/repository/reporte/<X>Exporter.java  — the PORT (no library types leak)
public interface ReportePredictivoExporter {
    byte[] toPdf(ReportePredictivoPlagas reporte);
    byte[] toExcel(ReportePredictivoPlagas reporte);
}
// infrastructure/reporte/<X>ExporterImpl.java  — @ApplicationScoped adapter (POI + PDFBox)
```
Export use cases assemble the domain model, the adapter renders `byte[]`. Both exporters return bytes (buffered in a `ByteArrayOutputStream`) — fine for bounded reports; switch to `StreamingOutput` for very large ones.

## PDF (PDFBox) — the real techniques
- `try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = ...)`; `doc.save(baos); return baos.toByteArray();`.
- Manual layout: keep a small `PdfContext { page, PDPageContentStream stream, float y, margins, fonts }`. Helpers you WILL need (PDFBox gives you none): `newPage()`, `ensureSpace(needed)` (auto page-break), `drawText`, `textWidth`, `wrapText` (greedy word-wrap by `font.getStringWidth/1000*size`), `drawTextTruncated` (… ellipsis), colored rects for cards/table headers/badges, a footer pass over `doc.getPages()` for "Page x of N".
- **`sanitize()` every string** — the Standard-14 Helvetica is WinAnsi: replace `– — ' ' " " … •` and strip `\r\n\t`, or `showText` throws on unsupported glyphs. (This is the #1 PDFBox crash.)
- Fonts: `PDType1Font(Standard14Fonts.FontName.HELVETICA*)` for built-ins; embed a TTF if you need full Unicode.

## Excel (POI) — the real techniques
- `try (XSSFWorkbook wb = ...; ByteArrayOutputStream baos = ...)`; one `XSSFSheet` per section (Resumen/Predicciones/Hotspots/Oportunidades).
- Pre-build a **styles holder** (`CellStyle`/`XSSFCellStyle` are workbook-scoped and limited — create each once, reuse; don't make a style per cell or you hit the 64k-style cap).
- `setColumnWidth(i, chars*256)`, `addMergedRegion(new CellRangeAddress(...))`, `createFreezePane(0,1)` for header rows, `setDisplayGridlines(false)`, alternating row styles, a `riskStyle(level)` switch for colored status cells.

## Download endpoint (JAX-RS)
```java
@GET @Path("/export/pdf")
@Produces("application/pdf")
public Response exportPdf(@QueryParam("...") ...) {
    // role gate (manual, advanced tier): Set.of(ADMIN, SELLER)
    byte[] pdf = exportPdfUseCase.execute(...);
    return Response.ok(pdf).type("application/pdf")
        .header("Content-Disposition", "attachment; filename=\"" + safeName + "\"").build();
}
// XLSX: @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
```
Build the filename from the params, slugified + `URLEncoder.encode(...).replace("+","%20")`.

## Verification gate
- Unit-test the data→model assembly with the exporter mocked.
- Integration test: generate a small file, assert non-empty bytes + (POI) the expected sheet names / (PDFBox) `PDDocument.load(bytes).getNumberOfPages()`.
- Manual: hit `/export/pdf` + `/export/excel`, open the downloads.

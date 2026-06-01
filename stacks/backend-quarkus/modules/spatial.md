# Module — Spatial (GPS / JTS geometry)

Store and query geographic coordinates on Quarkus + MySQL via Hibernate Spatial. Model: the `back-plaguie` `Location` (table `Ubicacion`).

## When to pick
Maps, "nearby", geofencing, per-entity lat/lng. Needs the advanced backend preset.

## Deps
```xml
<dependency><groupId>org.hibernate.orm</groupId><artifactId>hibernate-spatial</artifactId></dependency>
```
Brings JTS (`org.locationtech.jts`). MySQL column type `POINT`/`GEOMETRY`.

## Model + serialization
- Entity field: `org.locationtech.jts.geom.Point coordinates` mapped to a MySQL `POINT` column (Hibernate Spatial).
- **Custom Jackson serializer** (`JtsPointSerializer`): emit `{"longitude": x, "latitude": y}` to avoid infinite nesting from JTS geometry getters. Coordinate axes: `point.getCoordinate().getX()` = **longitude**, `.getY()` = **latitude** (easy to swap — assert in a test).
- Catalog chain example: `Estados → Municipios → Localidades → Predios` (State → Municipality → Locality → Property), find-or-create on each via a `LocationNormalizer.normalize()` (strip accents, lowercase, trim). Validate lat/lon ranges before persisting.

## ⚠️ H2 test gotcha (critical)
H2 does **not** recognize `POINT` as a DDL type. If the entity has `@Column(columnDefinition = "POINT")`, the table is never created in the test H2 DB → every integration test touching it fails with "Table … not found". **Fix:** drop `columnDefinition = "POINT"`. Production impact: none — MySQL `update` strategy never alters existing columns, and MySQL `GEOMETRY` stores JTS `Point` identically. (See `../advanced.md` + the project `handoff.md`.)

## Verification gate
- Unit-test the coordinate axis mapping (lat vs lon) and the normalizer.
- Integration test the find-or-create catalog chain against H2 (with the columnDefinition fix).
- Manual: `GET` a map endpoint, assert `{latitude, longitude}` shape and value ranges.

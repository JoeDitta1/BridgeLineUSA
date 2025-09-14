
# SCM AI Server — Part 2

Minimal API to persist materials, parts, aliases (synonyms), and last-used prices — with an offline-first normalizer.

## Run
```bash
cd server
npm install
npm run dev
# → http://localhost:4000/api/health
```

(Optional) Initialize the DB explicitly:
```bash
npm run initdb
```

## Endpoints
- `GET /api/health`
- `GET /api/materials`
- `POST /api/materials`  JSON body with { family, size, unit_type, grade?, weight_per_ft?, ... }
- `POST /api/materials/import`  (text/csv body) columns: family,size,od_in,schedule,wall_in,unit_type,grade,price_per_lb,price_per_ft,price_each,notes
- `GET /api/aliases`
- `POST /api/aliases`  { material_id, alias_text }
- `GET /api/parts`
- `POST /api/parts`  { partNumber, revision?, title? }
- `POST /api/normalize`  { text } → { match, confidence, via }
- `POST /api/prices/last`  { category, description, unit, grade, domestic, payload }
- `POST /api/prices/get`   { category, description, unit, grade, domestic }

## CSV Import (pipe schedules)
```bash
node scripts/import-pipe-csv.js ../pipe_catalog_sch_10_40_80_NPS_half_to_24.csv
```

## Client integration (optional, now)
- Keep your current client working off `materials.json`.
- You *can* start calling:
  - `POST /api/parts` whenever you blur Part/Revision/Description (to persist across machines).
  - `POST /api/prices/last` when you set a price (so pricing memory is shared).
- In the next step, I’ll switch the catalog to the API with a safe fallback to local JSON.

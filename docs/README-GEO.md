Geo data import

This project stores countries, states/provinces, and cities in lazy-loaded JSON files under `lib/geo/data` to keep memory and bundle size small.

Structure

- Countries index (choose one at runtime):
  - `lib/geo/data/countries.un.json` (UN members ~195)
  - `lib/geo/data/countries.iso.json` (full ISO ~249, includes territories)
- Per-country states: `lib/geo/data/states/{CC}.json`
- Per-state cities: `lib/geo/data/cities/{CC}/{STATE}.json`

Runtime selection
Set `UN_countries_only` in `lib/constants/site.ts` to pick UN-only vs full ISO at runtime.

Importer
Use the importer to generate files from a single world dataset:

Input JSON shape:

```
{
  "countries": [
    {
      "code": "US",
      "name": "United States",
      "hasStates": true,
      "states": [
        { "code": "CA", "name": "California", "cities": ["Los Angeles", "San Diego"] }
      ]
    }
  ]
}
```

Command:

```
node scripts/geo/import.js --input path/to/world.json --mode un
node scripts/geo/import.js --input path/to/world.json --mode iso
```

Notes

- The importer is idempotent; re-running overwrites existing JSON files.
- Missing `states` or `cities` arrays are treated as empty.
- City lists can be very large; the lazy loader only loads the requested state’s cities on demand.

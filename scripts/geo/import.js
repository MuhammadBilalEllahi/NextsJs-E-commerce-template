/*
Usage:
  node scripts/geo/import.js --input path/to/world.json --mode un|iso

Input JSON shape (example):
{
  "countries": [
    {
      "code": "US",
      "name": "United States",
      "hasStates": true,
      "states": [
        { "code": "CA", "name": "California", "cities": ["Los Angeles", "San Diego"] },
        { "code": "NY", "name": "New York", "cities": ["New York", "Buffalo"] }
      ]
    }
  ]
}
*/

const fs = require("fs");
const path = require("path");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { input: undefined, mode: "iso" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--input") out.input = args[++i];
    else if (a === "--mode") out.mode = args[++i];
  }
  if (!out.input) {
    console.error("--input is required");
    process.exit(1);
  }
  if (!fs.existsSync(out.input)) {
    console.error(`Input file not found: ${out.input}`);
    process.exit(1);
  }
  if (!["iso", "un"].includes(out.mode)) {
    console.error("--mode must be 'iso' or 'un'");
    process.exit(1);
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJSON(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function main() {
  const { input, mode } = parseArgs();
  const raw = fs.readFileSync(input, "utf8");
  const src = JSON.parse(raw);
  if (!Array.isArray(src.countries)) {
    console.error("Invalid input: 'countries' array missing");
    process.exit(1);
  }

  const root = path.join(__dirname, "..", "..", "lib", "geo", "data");
  const statesDir = path.join(root, "states");
  const citiesDir = path.join(root, "cities");

  // Build countries index
  const countriesIndex = {};
  for (const c of src.countries) {
    if (!c || !c.code || !c.name) continue;
    const cc = String(c.code).toUpperCase();
    const hasStates =
      Boolean(c.hasStates) || (Array.isArray(c.states) && c.states.length > 0);
    countriesIndex[cc] = { name: c.name, hasStates };

    if (hasStates) {
      const statesIndex = {};
      const states = Array.isArray(c.states) ? c.states : [];
      for (const s of states) {
        if (!s || !s.code || !s.name) continue;
        const sc = String(s.code).toUpperCase();
        statesIndex[sc] = { name: s.name };
        const cities = Array.isArray(s.cities) ? s.cities : [];
        if (cities.length > 0) {
          const citiesPath = path.join(citiesDir, cc, `${sc}.json`);
          writeJSON(citiesPath, cities);
        }
      }
      const statesPath = path.join(statesDir, `${cc}.json`);
      writeJSON(statesPath, statesIndex);
    }
  }

  const countriesFile = path.join(
    root,
    mode === "un" ? "countries.un.json" : "countries.iso.json"
  );
  writeJSON(countriesFile, countriesIndex);
  console.log(`Wrote countries index → ${countriesFile}`);
  console.log(`States dir → ${statesDir}`);
  console.log(`Cities dir → ${citiesDir}`);
}

main();

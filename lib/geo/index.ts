import type {
  Country,
  CountryCode,
  CountrySummary,
  StateCode,
  StateDetail,
  StateSummary,
  CountriesIndexFile,
  StatesIndexFile,
} from "./types";
import { UN_countries_only } from "../constants/site";

// In-memory caches to avoid repeated loads and keep memory bounded by what's used.
const countriesCache: {
  list?: CountrySummary[];
  map?: Map<CountryCode, CountrySummary>;
} = {};
const statesCache = new Map<CountryCode, Map<StateCode, StateSummary>>();
const citiesCache = new Map<string, ReadonlyArray<string>>(); // key: `${countryCode}:${stateCode}`

// Utility to build a stable key for caches
function getCitiesKey(countryCode: CountryCode, stateCode: StateCode): string {
  return `${countryCode.toUpperCase()}:${stateCode.toUpperCase()}`;
}

// Dynamically import JSON files. These imports are statically analyzable if files exist at build time.
async function loadCountriesIndex(): Promise<CountriesIndexFile> {
  if (UN_countries_only) {
    const mod = await import(
      /* webpackChunkName: "geo-countries-un" */ "./data/countries.un.json"
    );
    return mod.default as CountriesIndexFile;
  }
  const mod = await import(
    /* webpackChunkName: "geo-countries-iso" */ "./data/countries.iso.json"
  );
  return mod.default as CountriesIndexFile;
}

async function loadStatesIndex(
  countryCode: CountryCode
): Promise<StatesIndexFile> {
  const code = countryCode.toUpperCase();
  const mod = await import(
    /* webpackChunkName: "geo-states-[request]" */ `./data/states/${code}.json`
  );
  return mod.default as StatesIndexFile;
}

async function loadCities(
  countryCode: CountryCode,
  stateCode: StateCode
): Promise<string[]> {
  const cc = countryCode.toUpperCase();
  const sc = stateCode.toUpperCase();
  const mod = await import(
    /* webpackChunkName: "geo-cities-[request]" */ `./data/cities/${cc}/${sc}.json`
  );
  return (mod.default as string[]).slice();
}

// Public API

export async function listCountries(): Promise<CountrySummary[]> {
  if (countriesCache.list) return countriesCache.list;
  const index = await loadCountriesIndex();
  const list: CountrySummary[] = Object.entries(index).map(([code, value]) => ({
    code,
    name: value.name,
    hasStates: value.hasStates,
  }));
  // Sort by name for UX; keep map for O(1) access
  list.sort((a, b) => a.name.localeCompare(b.name));
  countriesCache.list = list;
  countriesCache.map = new Map(list.map((c) => [c.code, c]));
  return list;
}

export async function getCountry(countryCode: CountryCode): Promise<Country> {
  const code = countryCode.toUpperCase();
  if (!countriesCache.list) await listCountries();
  const summary = countriesCache.map?.get(code);
  if (!summary) throw new Error(`Country not found: ${code}`);
  const country: Country = { code, name: summary.name };
  if (summary.hasStates) {
    const states = await listStates(code);
    country.states = Object.fromEntries(
      states.map((s) => [s.code, { name: s.name }])
    );
  }
  return country;
}

export async function listStates(
  countryCode: CountryCode
): Promise<StateSummary[]> {
  const code = countryCode.toUpperCase();
  const cached = statesCache.get(code);
  if (cached)
    return Array.from(cached.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  const index = await loadStatesIndex(code);
  const map = new Map<StateCode, StateSummary>(
    Object.entries(index).map(([stateCode, value]) => [
      stateCode,
      { code: stateCode, name: value.name },
    ])
  );
  statesCache.set(code, map);
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getState(
  countryCode: CountryCode,
  stateCode: StateCode
): Promise<StateDetail> {
  const [cc, sc] = [countryCode.toUpperCase(), stateCode.toUpperCase()];
  const states = await listStates(cc);
  const summary = states.find((s) => s.code === sc);
  if (!summary) throw new Error(`State not found: ${cc}-${sc}`);
  const cities = await listCities(cc, sc);
  return { code: sc, name: summary.name, cities };
}

export async function listCities(
  countryCode: CountryCode,
  stateCode: StateCode
): Promise<string[]> {
  const key = getCitiesKey(countryCode, stateCode);
  const cached = citiesCache.get(key);
  if (cached) return cached.slice();
  const cities = await loadCities(countryCode, stateCode);
  // Keep a copy to avoid external mutation
  const frozen = Object.freeze(cities.slice());
  citiesCache.set(key, frozen);
  return frozen.slice();
}

// Convenience helpers for dropdowns
export async function getCountryOptions() {
  const countries = await listCountries();
  return countries.map((c) => ({ value: c.code, label: c.name }));
}

export async function getStateOptions(countryCode: CountryCode) {
  const states = await listStates(countryCode);
  return states.map((s) => ({ value: s.code, label: s.name }));
}

export async function getCityOptions(
  countryCode: CountryCode,
  stateCode: StateCode
) {
  const cities = await listCities(countryCode, stateCode);
  return cities.map((name) => ({ value: name, label: name }));
}

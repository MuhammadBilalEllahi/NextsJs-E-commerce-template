import type {
  Country,
  CountryCode,
  CountrySummary,
  StateCode,
  StateDetail,
  StateSummary,
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
/**
 * Build a stable cache key for cities lookups.
 * Internal usage to deduplicate city requests in memory.
 */
function getCitiesKey(countryCode: CountryCode, stateCode: StateCode): string {
  return `${countryCode.toUpperCase()}:${stateCode.toUpperCase()}`;
}

/**
 * Load raw countries dataset from `world-countries` lazily.
 * Consumers should prefer `listCountries()` instead of calling this directly.
 */
async function loadAllCountriesRaw() {
  const mod = await import(
    /* webpackChunkName: "geo-world-countries" */ "world-countries"
  );
  return (mod as any).default || (mod as any);
}

// Public API

/**
 * List countries for a country dropdown.
 * - Respects `UN_countries_only` flag for filtering UN members vs full ISO.
 * - Results are cached in-memory for the session.
 * Use when rendering the top-level country selector in forms.
 */
export async function listCountries(): Promise<CountrySummary[]> {
  if (countriesCache.list) return countriesCache.list;
  const raw = await loadAllCountriesRaw();
  const list: CountrySummary[] = (raw as any[])
    .filter((c) => (UN_countries_only ? c.unMember === true : true))
    .map((c) => ({
      code: (c.cca2 || c.cca3 || c.ccn3 || c.cioc || "").toUpperCase(),
      name: c?.name?.common || c?.name?.official || "Unknown",
      hasStates: true,
    }))
    .filter((c) => c.code && c.name);
  // Sort by name for UX; keep map for O(1) access
  list.sort((a, b) => a.name.localeCompare(b.name));
  countriesCache.list = list;
  countriesCache.map = new Map(list.map((c) => [c.code, c]));
  return list;
}

/**
 * Get a single country with its states included.
 * - Loads and caches countries; then loads that country's states.
 * Use to pre-hydrate forms where the country is known and states should be available.
 */
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

/**
 * List states/provinces for a given country.
 * - Lazy-imports `country-state-city` and caches results per country.
 * Use after a country selection to populate a state/province dropdown.
 */
export async function listStates(
  countryCode: CountryCode
): Promise<StateSummary[]> {
  const code = countryCode.toUpperCase();
  const cached = statesCache.get(code);
  if (cached)
    return Array.from(cached.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  const csc = await import("country-state-city");
  const states = (csc as any).State.getStatesOfCountry(code) as Array<any>;
  const map = new Map<StateCode, StateSummary>(
    states.map((s) => [
      s.isoCode.toUpperCase(),
      { code: s.isoCode.toUpperCase(), name: s.name },
    ])
  );
  statesCache.set(code, map);
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific state with its cities populated.
 * - Validates the state via `listStates`; then loads its cities.
 * Use when both country and state are preselected and city choices are needed.
 */
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

/**
 * List cities for a given (country, state) pair.
 * - Lazy-imports `country-state-city` and caches per key.
 * Use after a state selection to populate a city dropdown.
 */
export async function listCities(
  countryCode: CountryCode,
  stateCode: StateCode
): Promise<string[]> {
  const key = getCitiesKey(countryCode, stateCode);
  const cached = citiesCache.get(key);
  if (cached) return cached.slice();
  const csc = await import("country-state-city");
  const [cc, sc] = [countryCode.toUpperCase(), stateCode.toUpperCase()];
  const cities = (csc as any).City.getCitiesOfState(cc, sc).map(
    (x: any) => x.name
  ) as string[];
  // Keep a copy to avoid external mutation
  const frozen = Object.freeze(cities.slice());
  citiesCache.set(key, frozen);
  return frozen.slice();
}

// Convenience helpers for dropdowns
/**
 * Convenience: map countries to { value, label } for a <select>.
 * Use in UI forms/components for country dropdowns.
 */
export async function getCountryOptions() {
  const countries = await listCountries();
  return countries.map((c) => ({ value: c.code, label: c.name }));
}

/**
 * Convenience: map states to { value, label } for a <select>.
 * Use after choosing a country.
 */
export async function getStateOptions(countryCode: CountryCode) {
  const states = await listStates(countryCode);
  return states.map((s) => ({ value: s.code, label: s.name }));
}

/**
 * Convenience: map cities to { value, label } for a <select>.
 * Use after choosing a state.
 */
export async function getCityOptions(
  countryCode: CountryCode,
  stateCode: StateCode
) {
  const cities = await listCities(countryCode, stateCode);
  return cities.map((name) => ({ value: name, label: name }));
}

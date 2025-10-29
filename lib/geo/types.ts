export type CountryCode = string; // ISO 3166-1 alpha-2 preferred (e.g., "US")
export type StateCode = string; // ISO 3166-2 subdivision code without country prefix when practical (e.g., "CA" for California)

export interface CountrySummary {
  code: CountryCode;
  name: string;
  hasStates: boolean;
}

export interface StateSummary {
  code: StateCode;
  name: string;
}

export interface Country {
  code: CountryCode;
  name: string;
  states?: Record<StateCode, { name: string }>; // present only when loaded explicitly
}

export interface StateDetail {
  code: StateCode;
  name: string;
  cities?: string[]; // present only when loaded explicitly
}

export interface CountriesIndexFile {
  // code -> { name, hasStates }
  [code: CountryCode]: { name: string; hasStates: boolean };
}

export interface StatesIndexFile {
  // stateCode -> { name }
  [code: StateCode]: { name: string };
}

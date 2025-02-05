import {
  COUNTRY_CODES,
  ETHNICITIES,
  GENDERS,
  HEALTH_STATUSES,
  MARITAL_STATUSES,
  PROVINCES,
  RELIGIOUS_AFFILIATIONS,
  SPOKEN_LANGUAGES,
} from "../constants/census";

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

export type Province = (typeof PROVINCES)[number];

export type Ethnicity = (typeof ETHNICITIES)[number];

export type Gender = (typeof GENDERS)[number];

export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export type ReligiousAffiliation = (typeof RELIGIOUS_AFFILIATIONS)[number];

export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export type EducationLevel =
  | "none"
  | "primary"
  | "secondary"
  | "high-school"
  | "university-degree"
  | "postgraduate";

export type SourceOfIncome =
  | "stable-job"
  | "freelance"
  | "aid-support"
  | "no-income"
  | "other";

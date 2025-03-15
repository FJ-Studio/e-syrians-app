import {
  CountryCode,
  Ethnicity,
  Gender,
  Province,
  ReligiousAffiliation,
} from "./misc";

export type DailyRegistrations = Record<
  string,
  { registered: number; verified: number }
>;

export type CountryRegistrations = {
  [key in CountryCode]: {
    unverified: number;
    verified: number;
  };
};

export type HometownRegistrations = {
  [key in Province]: {
    unverified: number;
    verified: number;
  };
};

export type GenderRegistrations = {
  [key in Gender]: {
    unverified: number;
    verified: number;
  };
};

export type AgeRegistrations = {
  [key in string]: {
    unverified: number;
    verified: number;
  };
};

export type EthnicityRegistrations = {
  [key in Ethnicity]: {
    unverified: number;
    verified: number;
  };
};

export type ReligionRegistrations = {
  [key in ReligiousAffiliation]: {
    unverified: number;
    verified: number;
  };
};

export type RegistrationForm = {
  // personal data
  name: string;
  middle_name: string;
  surname: string;
  national_id: string;
  gender: Gender;
  birth_date: string;
  hometown: Province;
  ethnicity: Ethnicity;
  religious_affiliation: ReligiousAffiliation;
  record_place: string;
  record_id: string;
  // e-data
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  // location
  country: CountryCode;
  city: string;
  address: string;
  shelter: boolean;
  city_inside_syria: string;
  // education
  education_level: string;
  skills: string;
  languages: string;
  // employment
  source_of_income: string;
  estimated_monthly_income: string;
  number_of_dependents: string;
  // health
  health_status: string;
  health_insurance: boolean;
  easy_access_to_healthcare_services: boolean;
  // other
  marital_status: string;
  more_info: string;
  other_nationalities: string;
};

export type CensusStats = {
  daily_users?: DailyRegistrations;
  age?: AgeRegistrations;
  hometown?: HometownRegistrations;
  country?: CountryRegistrations;
  ethnicity?: EthnicityRegistrations;
  religion?: ReligionRegistrations;
  gender?: GenderRegistrations;
};

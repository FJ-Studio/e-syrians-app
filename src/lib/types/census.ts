import { CountryCode, Ethnicity, Gender, Province, ReligiousAffiliation } from "./misc";

export type DailyRegistrations = Array<{
    date: string;
    verified: number;
    unverified: number;
}>

export type CountryRegistrations = Array<{
    country: string; // ISO 3166-1 alpha-2
    count: number;
}>

export type ProvinceRegistrations = Array<{
    province: Province;
    count: number
}>

export type GenderRegistrations = Array<{
    gender: Gender;
    count: number;
}>

export type AgeRegistrations = Array<{
    bin: [number, number];
    count: number;
}>

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
    // location
    country: CountryCode;
    city: string;
    address: string;
    shelter: boolean;
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
}
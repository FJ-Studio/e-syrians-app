import { Gender, Province } from "./misc";

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
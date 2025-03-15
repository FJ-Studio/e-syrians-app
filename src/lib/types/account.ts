import {
  CountryCode,
  Ethnicity,
  Gender,
  Province,
  ReligiousAffiliation,
} from "./misc";

export type ESUser = {
  id: string;
  uuid: string;
  name?: string;
  surname?: string;
  email: string;
  phone?: string;
  accessToken: string;
  verified_at: string;
  verification_reason: string;
  roles: Array<string>;
  permissions: Array<string>;
  gender?: Gender;
  birth_date?: string;
  hometown?: Province;
  ethnicity?: Ethnicity;
  basic_info_updates?: number;
  avatar?: string;
  national_id?: string;
  record_id?: string;
  country?: CountryCode;
  middle_name?: string;
  religious_affiliation?: ReligiousAffiliation;
  other_nationalities?: string;
  city?: string;
  address?: string;
  shelter?: string;
  education_level?: string;
  languages?: string;
  skills?: string;
  source_of_income?: string;
  marital_status?: string;
  estimated_monthly_income?: string;
  number_of_dependents?: string;
  health_status?: string;
  health_insurance?: string;
  easy_access_to_healthcare_services?: string;
  more_info?: string;

  facebook_link?: string;
  twitter_link?: string;
  instagram_link?: string;
  linkedin_link?: string;
  youtube_link?: string;
  twitch_link?: string;
  tiktok_link?: string;
  website?: string;
  github_link?: string;
  snapchat_link?: string;
  pinterest_link?: string;

  email_verified_at?: string;
  phone_verified_at?: string;

  received_verification_email: boolean;
  account_verified_email: boolean;

  language: string;
  city_inside_syria: string;
};

export type Verification = {
  id: string;
  created_at: string;
  user: {
    name: string;
    surname: string;
    avatar: string;
  };
  verifier: {
    name: string;
    surname: string;
    avatar: string;
  };
  cancelled_at: string;
  cancelation_payload?: {
    reason?: string;
  };
};

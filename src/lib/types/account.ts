import { Ethnicity, Gender, Province } from "./misc";

export type ESUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accessToken: string;
  verifiedAt: string;
  roles: Array<string>;
  permissions: Array<string>;
  gender: Gender;
  birth_date: string;
  hometown: Province;
  ethnicity: Ethnicity;
  basic_info_updates?: number;
  avatar?: string;

  facebook_link: string;
  twitter_link: string;
  instagram_link: string;
  linkedin_link: string;
  youtube_link: string;
  twitch_link: string;
  tiktok_link: string;
  website: string;
  github_link: string;
  snapchat_link: string;
  pinterest_link: string;
  
}
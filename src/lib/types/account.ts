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
}
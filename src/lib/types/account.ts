export type ESUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accessToken: string;
  verifiedAt: string;
  roles: Array<string>;
  permissions: Array<string>;
}
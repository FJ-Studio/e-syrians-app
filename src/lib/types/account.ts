export type ESUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accessToken: string;
  permissions: Array<string>;
}
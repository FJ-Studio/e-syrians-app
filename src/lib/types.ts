import { LOCALES } from './constants';

export type Locale = typeof LOCALES[number];

export type DeliveryPoint = {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  description?: string;
}

export type ESUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accessToken: string;
  permissions: Array<string>;
}

export type WeaponDeliveryForm = {
  name: string;
  surname: string;
  national_id: string;
  weapons: string;
  notes: string;
  address: string;
  phone: string;
}
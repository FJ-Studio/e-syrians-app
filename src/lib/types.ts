import { LOCALES } from './constants';

export type Locale = typeof LOCALES[number];

export type DeliveryPoint = {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
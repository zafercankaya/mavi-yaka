import { z } from 'zod';
import { Market } from './job';

export interface LocationPublic {
  id: string;
  country: Market;
  state: string;
  city: string | null;
  latitude: number;
  longitude: number;
  population: number | null;
  nameLocal: string;
  nameEn: string;
}

export const locationSearchSchema = z.object({
  country: z.nativeEnum(Market),
  query: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LocationSearch = z.infer<typeof locationSearchSchema>;

export const geoSearchSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(500).default(25),
  country: z.nativeEnum(Market).optional(),
});

export type GeoSearch = z.infer<typeof geoSearchSchema>;

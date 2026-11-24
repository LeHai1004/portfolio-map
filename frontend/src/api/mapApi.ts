import { api } from "./client";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type MapPin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type: string;
  thumbnailUrl: string;
};

export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export async function getMapPins(bounds: MapBounds): Promise<MapPin[]> {
  const response = await api.get<MapPin[]>("/api/map/pins", {
    params: bounds,
  });
  return response.data.map((pin) => ({
    ...pin,
    thumbnailUrl: toAbsoluteUrl(pin.thumbnailUrl),
  }));
}

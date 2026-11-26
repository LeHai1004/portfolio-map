import { api } from "./client";
import type { ProjectType } from "./projectsApi";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type MapPin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type: string;
  thumbnailUrl: string | null;
};

export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type MapPinFilters = {
  types: ProjectType[];
  tagIds: number[];
};

export async function getMapPins(
  bounds: MapBounds,
  filters?: MapPinFilters,
): Promise<MapPin[]> {
  const types: (ProjectType | undefined)[] =
    filters?.types.length ? filters.types : [undefined];
  const tagIds: (number | undefined)[] =
    filters?.tagIds.length ? filters.tagIds : [undefined];
  const responses = await Promise.all(
    types.flatMap((type) =>
      tagIds.map((tag) =>
        api.get<MapPin[]>("/api/map/pins", {
          params: {
            ...bounds,
            ...(type === undefined ? {} : { type }),
            ...(tag === undefined ? {} : { tag }),
          },
        }),
      ),
    ),
  );
  const uniquePins = new Map<number, MapPin>();

  for (const pin of responses.flatMap(({ data }) => data)) {
    uniquePins.set(pin.id, {
      ...pin,
      thumbnailUrl: toAbsoluteUrl(pin.thumbnailUrl),
    });
  }

  return [...uniquePins.values()].sort((left, right) => left.id - right.id);
}

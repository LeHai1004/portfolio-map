import { api } from "./client";
import type {
  PagedResult,
  ProjectSummaryDto,
  ProjectType,
} from "./projectsApi";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type ProjectSearchFilters = {
  keyword: string;
  types: ProjectType[];
  tagIds: number[];
  universityId: number | null;
};

export type NearbyProjectDto = ProjectSummaryDto & {
  distanceKm: number;
};

const SEARCH_PAGE_SIZE = 50;

export async function searchProjects(
  filters: ProjectSearchFilters,
  page: number,
): Promise<PagedResult<ProjectSummaryDto>> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page phải từ 1 trở lên");
  }

  const types: (ProjectType | undefined)[] = filters.types.length
    ? [...new Set(filters.types)]
    : [undefined];
  const tagIds: (number | undefined)[] = filters.tagIds.length
    ? [...new Set(filters.tagIds)]
    : [undefined];
  const keyword = filters.keyword.trim();
  const responses = await Promise.all(
    types.flatMap((type) =>
      tagIds.map((tag) =>
        api.get<PagedResult<ProjectSummaryDto>>("/api/projects", {
          params: {
            ...(keyword ? { keyword } : {}),
            ...(type === undefined ? {} : { type }),
            ...(tag === undefined ? {} : { tag }),
            ...(filters.universityId === null
              ? {}
              : { universityId: filters.universityId }),
            page,
            pageSize: SEARCH_PAGE_SIZE,
          },
        }),
      ),
    ),
  );
  const uniqueProjects = new Map<number, ProjectSummaryDto>();
  for (const response of responses) {
    for (const project of response.data.items) {
      uniqueProjects.set(project.id, {
        ...project,
        thumbnailUrl: toAbsoluteUrl(project.thumbnailUrl),
      });
    }
  }

  const items = [...uniqueProjects.values()]
    .sort(
      (left, right) =>
        Date.parse(right.createdAt) - Date.parse(left.createdAt) ||
        right.id - left.id,
    )
    .slice(0, SEARCH_PAGE_SIZE);

  return {
    items,
    page,
    pageSize: SEARCH_PAGE_SIZE,
    totalItems: responses.reduce(
      (total, response) => total + response.data.totalItems,
      0,
    ),
  };
}

export async function getNearbyProjects(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<NearbyProjectDto[]> {
  const response = await api.get<NearbyProjectDto[]>("/api/projects/nearby", {
    params: { lat, lng, radiusKm },
  });
  return response.data.map((project) => ({
    ...project,
    thumbnailUrl: toAbsoluteUrl(project.thumbnailUrl),
  }));
}

import type {
  PagedResult,
  ProjectSummaryDto,
  ProjectType,
} from "./projectsApi";

export type ProjectSearchFilters = {
  keyword: string;
  types: ProjectType[];
  tagIds: number[];
  universityId: number | null;
};

export type NearbyProjectDto = ProjectSummaryDto & {
  distanceKm: number;
};

type MockProject = ProjectSummaryDto & {
  description: string;
  tagIds: number[];
  universityId: number | null;
};

const SEARCH_PAGE_SIZE = 20;
const EARTH_RADIUS_KM = 6371.0088;

const mockProjects: MockProject[] = [
  {
    id: 1,
    title: "App quản lý chi tiêu",
    type: "Mobile",
    thumbnailUrl: null,
    latitude: 16.0738,
    longitude: 108.1499,
    createdAt: "2026-06-20T00:00:00Z",
    description: "Ứng dụng ghi chép thu chi cá nhân, có biểu đồ theo tháng.",
    universityId: 1,
    tagIds: [7, 2],
  },
  {
    id: 2,
    title: "Website portfolio sinh viên",
    type: "Web",
    thumbnailUrl: null,
    latitude: 16.0745,
    longitude: 108.151,
    createdAt: "2026-06-25T00:00:00Z",
    description: "Trang giới thiệu dự án cá nhân bằng React.",
    universityId: 1,
    tagIds: [1, 6],
  },
  {
    id: 3,
    title: "Game platformer 2D",
    type: "Game",
    thumbnailUrl: null,
    latitude: 16.061,
    longitude: 108.158,
    createdAt: "2026-06-28T00:00:00Z",
    description: "Game đi cảnh làm bằng Unity, có 5 màn chơi.",
    universityId: 2,
    tagIds: [4, 2],
  },
  {
    id: 4,
    title: "Nhận diện biển số xe",
    type: "AI",
    thumbnailUrl: null,
    latitude: 16.0598,
    longitude: 108.2105,
    createdAt: "2026-06-30T00:00:00Z",
    description: "Đồ án AI nhận diện biển số từ ảnh.",
    universityId: 4,
    tagIds: [5, 9],
  },
  {
    id: 5,
    title: "Hệ thống quản lý thư viện",
    type: "Web",
    thumbnailUrl: null,
    latitude: 15.969,
    longitude: 108.26,
    createdAt: "2026-07-01T00:00:00Z",
    description: "Website quản lý mượn trả sách.",
    universityId: 5,
    tagIds: [3, 8],
  },
];

function toProjectSummary(project: MockProject): ProjectSummaryDto {
  const {
    description: _description,
    tagIds: _tagIds,
    universityId: _universityId,
    ...summary
  } = project;
  return summary;
}

function distanceInKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

// TODO: Replace this mock with GET /api/projects when it supports multiple type and tag values.
export async function searchProjects(
  filters: ProjectSearchFilters,
  page: number,
): Promise<PagedResult<ProjectSummaryDto>> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page phải từ 1 trở lên");
  }

  const keyword = filters.keyword.trim().toLocaleLowerCase();
  const selectedTypes = new Set(filters.types);
  const selectedTagIds = new Set(filters.tagIds);
  const matchingProjects = mockProjects
    .filter((project) => {
      const keywordMatches =
        keyword.length === 0 ||
        `${project.title} ${project.description}`
          .toLocaleLowerCase()
          .includes(keyword);
      const typeMatches =
        selectedTypes.size === 0 || selectedTypes.has(project.type);
      const tagMatches =
        selectedTagIds.size === 0 ||
        project.tagIds.some((tagId) => selectedTagIds.has(tagId));
      const universityMatches =
        filters.universityId === null ||
        project.universityId === filters.universityId;

      return (
        keywordMatches && typeMatches && tagMatches && universityMatches
      );
    })
    .sort(
      (left, right) =>
        Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  const start = (page - 1) * SEARCH_PAGE_SIZE;

  return {
    items: matchingProjects
      .slice(start, start + SEARCH_PAGE_SIZE)
      .map(toProjectSummary),
    page,
    pageSize: SEARCH_PAGE_SIZE,
    totalItems: matchingProjects.length,
  };
}

// TODO: Replace this mock with GET /api/projects/nearby when the endpoint is connected.
export async function getNearbyProjects(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<NearbyProjectDto[]> {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new RangeError("lat phải từ -90 đến 90");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new RangeError("lng phải từ -180 đến 180");
  }
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
    throw new RangeError("radiusKm phải lớn hơn 0 và tối đa 50");
  }

  return mockProjects
    .map((project) => ({
      project: toProjectSummary(project),
      distanceKm: distanceInKm(
        lat,
        lng,
        project.latitude,
        project.longitude,
      ),
    }))
    .filter(({ distanceKm }) => distanceKm <= radiusKm)
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 100)
    .map(({ project, distanceKm }) => ({
      ...project,
      distanceKm: Math.round(distanceKm * 100) / 100,
    }));
}

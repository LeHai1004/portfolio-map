import { api } from "./client";
import type {
  PagedResult,
  ProjectSummaryDto,
} from "./projectsApi";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type SavedProjectDto = {
  project: ProjectSummaryDto;
  savedAt: string;
};

export async function saveProject(projectId: number): Promise<void> {
  await api.post(`/api/saved-projects/${projectId}`);
}

export async function removeSavedProject(projectId: number): Promise<void> {
  await api.delete(`/api/saved-projects/${projectId}`);
}

export async function getSavedProjects(
  page = 1,
  pageSize = 10,
): Promise<PagedResult<SavedProjectDto>> {
  const response = await api.get<PagedResult<SavedProjectDto>>(
    "/api/saved-projects",
    { params: { page, pageSize } },
  );
  return {
    ...response.data,
    items: response.data.items.map((item) => ({
      ...item,
      project: {
        ...item.project,
        thumbnailUrl: toAbsoluteUrl(item.project.thumbnailUrl),
      },
    })),
  };
}

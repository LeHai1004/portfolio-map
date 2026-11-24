import { isAxiosError } from "axios";
import { api } from "./client";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type ProjectType = "Web" | "Mobile" | "Game" | "AI" | "Other";

export type CreateProjectRequest = {
  title: string;
  description?: string;
  type: ProjectType;
  latitude: number;
  longitude: number;
  addressText?: string;
  universityId?: number;
  githubUrl?: string;
  demoUrl?: string;
  tagIds: number[];
};

export type UpdateProjectRequest = CreateProjectRequest;

export type ProjectDetailDto = {
  id: number;
  title: string;
  description: string | null;
  type: ProjectType;
  latitude: number;
  longitude: number;
  addressText: string | null;
  universityId: number | null;
  universityName: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  images: { id: number; imageUrl: string }[];
  tags: { id: number; name: string }[];
  owner: { id: string; fullName: string; avatarUrl: string | null };
  viewCount: number;
  createdAt: string;
};

export type ProjectSummaryDto = {
  id: number;
  title: string;
  type: ProjectType;
  thumbnailUrl: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
};

function withAbsoluteProjectUrls(project: ProjectDetailDto): ProjectDetailDto {
  return {
    ...project,
    thumbnailUrl: toAbsoluteUrl(project.thumbnailUrl),
    images: project.images.map((image) => ({
      ...image,
      imageUrl: toAbsoluteUrl(image.imageUrl),
    })),
    owner: {
      ...project.owner,
      avatarUrl: toAbsoluteUrl(project.owner.avatarUrl),
    },
  };
}

function withAbsoluteSummaryUrl(
  project: ProjectSummaryDto,
): ProjectSummaryDto {
  return { ...project, thumbnailUrl: toAbsoluteUrl(project.thumbnailUrl) };
}

export async function getProjectById(
  id: number,
): Promise<ProjectDetailDto | null> {
  try {
    const response = await api.get<ProjectDetailDto>(`/api/projects/${id}`);
    return withAbsoluteProjectUrls(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function getMyProjects(): Promise<
  PagedResult<ProjectSummaryDto>
> {
  const response = await api.get<PagedResult<ProjectSummaryDto>>(
    "/api/projects/mine",
    { params: { page: 1, pageSize: 50 } },
  );
  return {
    ...response.data,
    items: response.data.items.map(withAbsoluteSummaryUrl),
  };
}

export async function updateProject(
  id: number,
  data: UpdateProjectRequest,
): Promise<ProjectDetailDto> {
  const response = await api.put<ProjectDetailDto>(`/api/projects/${id}`, data);
  return withAbsoluteProjectUrls(response.data);
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}

export async function createProject(
  data: CreateProjectRequest,
): Promise<ProjectDetailDto> {
  const response = await api.post<ProjectDetailDto>("/api/projects", data);
  return withAbsoluteProjectUrls(response.data);
}

export async function uploadProjectImage(
  projectId: number,
  file: File,
): Promise<{ id: number; imageUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ id: number; imageUrl: string }>(
    `/api/projects/${projectId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return { ...response.data, imageUrl: toAbsoluteUrl(response.data.imageUrl) };
}

export async function deleteProjectImage(
  projectId: number,
  imageId: number,
): Promise<void> {
  await api.delete(`/api/projects/${projectId}/images/${imageId}`);
}

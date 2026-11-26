import { api } from "./client";
import type { ProjectType } from "./projectsApi";

export type AdminProjectDto = {
  id: number;
  title: string;
  type: ProjectType;
  status: "Active" | "Hidden";
  ownerId: string;
  ownerName: string;
  createdAt: string;
};

export type AdminUserDto = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isLocked: boolean;
  createdAt: string;
};

export type AdminPagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
};

type AdminPageRequest = {
  page: number;
  pageSize: number;
};

export async function getAdminProjects({
  page,
  pageSize,
}: AdminPageRequest): Promise<AdminPagedResult<AdminProjectDto>> {
  const response = await api.get<AdminPagedResult<AdminProjectDto>>(
    "/api/admin/projects",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function setProjectStatus(
  id: number,
  status: AdminProjectDto["status"],
): Promise<AdminProjectDto> {
  const response = await api.put<AdminProjectDto>(
    `/api/admin/projects/${id}/status`,
    { status },
  );
  return response.data;
}

export async function getAdminUsers({
  page,
  pageSize,
}: AdminPageRequest): Promise<AdminPagedResult<AdminUserDto>> {
  const response = await api.get<AdminPagedResult<AdminUserDto>>(
    "/api/admin/users",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function setUserLocked(
  id: string,
  isLocked: boolean,
): Promise<AdminUserDto> {
  const response = await api.put<AdminUserDto>(
    `/api/admin/users/${encodeURIComponent(id)}/lock`,
    { isLocked },
  );
  return response.data;
}

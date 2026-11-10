import { api } from "../../api/client";

export type UserProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: "Student" | "Company" | "Admin";
  universityId: number | null;
  major: string | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
};

export type UpdateMeRequest = {
  fullName: string;
  universityId?: number | null;
  major?: string | null;
  githubUrl?: string | null;
  linkedInUrl?: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export async function getUser(id: string): Promise<UserProfile | null> {
  const response = await api.get<UserProfile>(`/api/users/${encodeURIComponent(id)}`);
  return response.data;
}

export async function updateMe(
  request: UpdateMeRequest,
): Promise<UserProfile> {
  const response = await api.put<UserProfile>("/api/users/me", request);
  return response.data;
}

export async function changePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  await api.put("/api/users/me/password", request);
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ avatarUrl: string }>(
    "/api/users/me/avatar",
    formData,
  );
  return response.data;
}

import { api } from "./client";

export type TagDto = {
  id: number;
  name: string;
};

export async function getTags(): Promise<TagDto[]> {
  const response = await api.get<TagDto[]>("/api/tags");
  return response.data;
}

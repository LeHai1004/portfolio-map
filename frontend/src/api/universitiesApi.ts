import { api } from "./client";

export type UniversityDto = {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

export async function getUniversities(): Promise<UniversityDto[]> {
  const response = await api.get<UniversityDto[]>("/api/universities");
  return response.data;
}

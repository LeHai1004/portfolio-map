import { isAxiosError } from "axios";
import { api } from "./client";

export type CompanyProfileDto = {
  id: string;
  companyName: string;
  website: string | null;
  address: string | null;
  description: string | null;
  logoUrl: string | null;
};

export type UpdateCompanyProfileRequest = {
  companyName: string;
  website: string | null;
  address: string | null;
  description: string | null;
  logoUrl: string | null;
};

export async function getCompanyById(
  id: string,
): Promise<CompanyProfileDto | null> {
  try {
    const response = await api.get<CompanyProfileDto>(
      `/api/companies/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateCompanyProfile(
  data: UpdateCompanyProfileRequest,
): Promise<CompanyProfileDto> {
  const response = await api.put<CompanyProfileDto>(
    "/api/companies/me",
    data,
  );
  return response.data;
}

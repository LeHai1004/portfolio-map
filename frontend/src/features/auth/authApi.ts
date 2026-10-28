import axios from "axios";
import { api } from "../../api/client";

export type UserRole = "Student" | "Company";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
};

export type RegisterResponse = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};

type ApiErrorResponse = {
  message?: unknown;
  errors?: unknown;
};

export type AuthApiError = {
  message: string;
  errors: Record<string, string[]>;
};

export async function register(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>(
    "/api/auth/register",
    request,
  );
  return response.data;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", request);
  return response.data;
}

export async function me(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/api/auth/me");
  return response.data;
}

export function getAuthApiError(error: unknown): AuthApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      message: "Đã xảy ra lỗi. Vui lòng thử lại.",
      errors: {},
    };
  }

  const payload = error.response?.data;
  const message =
    payload && typeof payload.message === "string"
      ? payload.message
      : error.message || "Không thể kết nối máy chủ. Vui lòng thử lại.";
  const errors: Record<string, string[]> = {};

  if (payload?.errors && typeof payload.errors === "object") {
    for (const [field, messages] of Object.entries(payload.errors)) {
      if (Array.isArray(messages)) {
        const fieldMessages = messages.filter(
          (item): item is string => typeof item === "string",
        );
        if (fieldMessages.length > 0) {
          errors[field] = fieldMessages;
        }
      }
    }
  }

  return { message, errors };
}

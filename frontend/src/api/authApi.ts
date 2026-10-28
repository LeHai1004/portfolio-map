import { isAxiosError } from "axios";
import { api } from "./client";

export type AuthRole = "Student" | "Company";

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  role: AuthRole;
};

export type RegisterResponse = {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl: string | null;
  };
};

type AuthApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
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

export function getAuthErrorMessage(error: unknown): string {
  if (isAxiosError<AuthApiErrorResponse>(error)) {
    const body = error.response?.data;
    const details = body?.errors
      ? Object.values(body.errors).flat().filter(Boolean)
      : [];
    const messages = [body?.message, ...details].filter(
      (message): message is string => Boolean(message),
    );

    if (messages.length > 0) {
      return [...new Set(messages)].join(" ");
    }

    if (!error.response) {
      return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

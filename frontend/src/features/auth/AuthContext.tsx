import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router-dom";
import { clearToken, getToken, setToken } from "../../api/token";
import {
  getAuthApiError,
  login as loginRequest,
  me,
  type AuthUser,
  type LoginRequest,
} from "./authApi";
import { AuthContext } from "./authContextStore";

export default function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      return () => {
        active = false;
      };
    }

    me()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          setAuthError(null);
        }
      })
      .catch((error: unknown) => {
        const apiError = getAuthApiError(error);
        if (active) {
          if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
          ) {
            clearToken();
          }
          setUser(null);
          setAuthError(apiError.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (request: LoginRequest) => {
    const response = await loginRequest(request);
    setToken(response.accessToken);
    setUser(response.user);
    setAuthError(null);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setAuthError(null);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress aria-label="Đang tải phiên đăng nhập" />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, authError, login, logout }}
    >
      {children ?? <Outlet />}
    </AuthContext.Provider>
  );
}

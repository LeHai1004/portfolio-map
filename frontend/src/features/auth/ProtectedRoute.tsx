import { Alert, Box, Button } from "@mui/material";
import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./authContextStore";
import type { UserRole } from "./authApi";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: ReactNode;
};

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button component={Link} to="/" color="inherit" size="small">
              Về trang chủ
            </Button>
          }
        >
          Bạn không có quyền truy cập trang này.
        </Alert>
      </Box>
    );
  }

  return children;
}

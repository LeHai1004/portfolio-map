import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "./authContextStore";
import { getAuthApiError, type LoginRequest } from "./authApi";

type LoginFormValues = LoginRequest;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, authError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (request: LoginFormValues) => {
    setServerError(null);
    try {
      await login(request);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const apiError = getAuthApiError(error);
      let hasFieldErrors = false;

      for (const [field, messages] of Object.entries(apiError.errors)) {
        const error = { type: "server", message: messages.join(" ") };
        switch (field) {
          case "email":
            setError("email", error);
            hasFieldErrors = true;
            break;
          case "password":
            setError("password", error);
            hasFieldErrors = true;
            break;
        }
      }

      if (!hasFieldErrors) {
        setServerError(apiError.message);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", p: 3 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Đăng nhập
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tiếp tục khám phá các dự án trên bản đồ
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            {...register("email", {
              required: "Email là bắt buộc.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ.",
              },
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            {...register("password", {
              required: "Mật khẩu là bắt buộc.",
              minLength: {
                value: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự.",
              },
            })}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          {authError && <Alert severity="warning">{authError}</Alert>}
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Box>
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Chưa có tài khoản?{" "}
          <MuiLink component={Link} to="/register">
            Đăng ký
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}

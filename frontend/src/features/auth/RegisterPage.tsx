import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  getAuthApiError,
  register as registerUser,
  type RegisterRequest,
  type UserRole,
} from "./authApi";

type RegisterFormValues = RegisterRequest & { confirmPassword: string };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", role: "Student" },
  });

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...request }: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(request);
      navigate("/login", { replace: true });
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
          case "fullName":
            setError("fullName", error);
            hasFieldErrors = true;
            break;
          case "role":
            setError("role", error);
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
    <Box sx={{ maxWidth: 520, mx: "auto", p: 3 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tạo tài khoản
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tham gia cộng đồng Portfolio Map
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
            autoComplete="new-password"
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
          <TextField
            label="Nhập lại mật khẩu"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "Vui lòng nhập lại mật khẩu.",
              validate: (value, values) =>
                value === values.password || "Mật khẩu nhập lại không khớp.",
            })}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
          />
          <TextField
            label="Họ tên"
            autoComplete="name"
            {...register("fullName", { required: "Họ tên là bắt buộc." })}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
          />
          <Controller
            name="role"
            control={control}
            rules={{ required: "Vui lòng chọn vai trò." }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Vai trò"
                error={Boolean(errors.role)}
                helperText={errors.role?.message}
              >
                {(["Student", "Company"] as UserRole[]).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role === "Student" ? "Sinh viên" : "Công ty"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </Box>
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Đã có tài khoản?{" "}
          <MuiLink component={Link} to="/login">
            Đăng nhập
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}

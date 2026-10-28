import { useState } from "react";
<<<<<<< HEAD
=======
import { Link as RouterLink } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
import {
  Alert,
  Box,
  Button,
<<<<<<< HEAD
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
=======
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import {
  getAuthErrorMessage,
  register,
  type AuthRole,
} from "../../api/authApi";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AuthRole>("Student");

  const mutation = useMutation({ mutationFn: register });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role,
    });
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", px: 2, py: 6 }}>
      <Card>
        <CardContent
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2, p: { xs: 3, sm: 4 } }}
        >
          <Typography variant="h5" component="h1">
            Đăng ký
          </Typography>
          <Typography color="text.secondary">
            Tạo tài khoản để tham gia Portfolio Map.
          </Typography>

          {mutation.isSuccess ? (
            <Alert severity="success">
              Đăng ký thành công.{" "}
              <Link component={RouterLink} to="/login">
                Đăng nhập ngay
              </Link>
            </Alert>
          ) : (
            <>
              <TextField
                label="Họ tên"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Mật khẩu"
                type="password"
                autoComplete="new-password"
                required
                slotProps={{ htmlInput: { minLength: 8 } }}
                helperText="Mật khẩu phải có ít nhất 8 ký tự."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <FormControl>
                <FormLabel id="register-role-label">Bạn là</FormLabel>
                <RadioGroup
                  aria-labelledby="register-role-label"
                  name="role"
                  value={role}
                  onChange={(event) => {
                    if (
                      event.target.value === "Student" ||
                      event.target.value === "Company"
                    ) {
                      setRole(event.target.value);
                    }
                  }}
                >
                  <FormControlLabel
                    value="Student"
                    control={<Radio />}
                    label="Sinh viên"
                  />
                  <FormControlLabel
                    value="Company"
                    control={<Radio />}
                    label="Công ty"
                  />
                </RadioGroup>
              </FormControl>

              {mutation.isError && (
                <Alert severity="error">
                  {getAuthErrorMessage(mutation.error)}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Đang đăng ký..." : "Tạo tài khoản"}
              </Button>
            </>
          )}

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <Link component={RouterLink} to="/login">
              Đăng nhập
            </Link>
          </Typography>
        </CardContent>
      </Card>
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
    </Box>
  );
}

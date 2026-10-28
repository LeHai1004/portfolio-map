import { useState } from "react";
<<<<<<< HEAD
=======
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
import {
  Alert,
  Box,
  Button,
<<<<<<< HEAD
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
=======
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { getAuthErrorMessage, login } from "../../api/authApi";
import { setToken } from "../../api/token";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.accessToken);
      navigate("/");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ email: email.trim(), password });
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", px: 2, py: 6 }}>
      <Card>
        <CardContent
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2, p: { xs: 3, sm: 4 } }}
        >
          <Typography variant="h5" component="h1">
            Đăng nhập
          </Typography>
          <Typography color="text.secondary">
            Đăng nhập để tiếp tục sử dụng Portfolio Map.
          </Typography>

>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
<<<<<<< HEAD
            {...register("email", {
              required: "Email là bắt buộc.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ.",
              },
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
=======
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
          />
          <TextField
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
<<<<<<< HEAD
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
=======
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

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
            {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Chưa có tài khoản?{" "}
            <Link component={RouterLink} to="/register">
              Đăng ký
            </Link>
          </Typography>
        </CardContent>
      </Card>
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
    </Box>
  );
}

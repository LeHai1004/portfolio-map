import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
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
            autoComplete="current-password"
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
    </Box>
  );
}

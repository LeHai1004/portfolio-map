import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
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
    </Box>
  );
}

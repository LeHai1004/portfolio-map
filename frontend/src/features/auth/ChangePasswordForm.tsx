import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { getAuthApiError } from "./authApi";
import {
  changePassword,
  type ChangePasswordRequest,
} from "./userApi";

type ChangePasswordFormValues = ChangePasswordRequest;
type PasswordField = keyof ChangePasswordFormValues;

const passwordFields: Record<string, PasswordField> = {
  currentpassword: "currentPassword",
  newpassword: "newPassword",
  confirmnewpassword: "confirmNewPassword",
};

export default function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>();
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      setServerError(null);
      setSuccessMessage("Đổi mật khẩu thành công.");
    },
    onError: (error: unknown) => {
      const apiError = getAuthApiError(error);
      setServerError(apiError.message);
      setSuccessMessage(null);

      for (const [field, messages] of Object.entries(apiError.errors)) {
        const formField = passwordFields[field.toLowerCase()];
        if (formField && messages.length > 0) {
          setError(formField, {
            type: "server",
            message: messages.join(" "),
          });
        }
      }
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    mutation.mutate(values);
  };

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, display: "grid", gap: 2 }}
    >
      <Typography variant="h6" component="h2">
        Đổi mật khẩu
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: "grid", gap: 2 }}
      >
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        <TextField
          label="Mật khẩu hiện tại"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword", {
            required: "Mật khẩu hiện tại là bắt buộc.",
          })}
          error={Boolean(errors.currentPassword)}
          helperText={errors.currentPassword?.message}
        />
        <TextField
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          {...register("newPassword", {
            required: "Mật khẩu mới là bắt buộc.",
            minLength: {
              value: 8,
              message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
            },
          })}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword?.message}
        />
        <TextField
          label="Nhập lại mật khẩu mới"
          type="password"
          autoComplete="new-password"
          {...register("confirmNewPassword", {
            required: "Vui lòng nhập lại mật khẩu mới.",
            validate: (value, formValues) =>
              value === formValues.newPassword || "Mật khẩu nhập lại không khớp.",
          })}
          error={Boolean(errors.confirmNewPassword)}
          helperText={errors.confirmNewPassword?.message}
        />
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </Button>
      </Box>
    </Paper>
  );
}

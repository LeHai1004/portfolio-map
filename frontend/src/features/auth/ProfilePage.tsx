import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "./authContextStore";
import { getAuthApiError } from "./authApi";
import ChangePasswordForm from "./ChangePasswordForm";
import {
  getUser,
  updateMe,
  uploadAvatar,
  type UpdateMeRequest,
  type UserProfile,
} from "./userApi";

type ProfileFormValues = {
  fullName: string;
  universityId: string;
  major: string;
  githubUrl: string;
  linkedInUrl: string;
};

type ProfileField = keyof ProfileFormValues;

const profileFields: Record<string, ProfileField> = {
  fullname: "fullName",
  universityid: "universityId",
  major: "major",
  githuburl: "githubUrl",
  linkedinurl: "linkedInUrl",
};

function toProfileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    fullName: profile.fullName,
    universityId: profile.universityId?.toString() ?? "",
    major: profile.major ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedInUrl: profile.linkedInUrl ?? "",
  };
}

function getAvatarSrc(avatarUrl: string | null): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl ? new URL(avatarUrl, apiUrl).toString() : avatarUrl;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: () => {
      if (!user) {
        throw new Error("Không tìm thấy người dùng đang đăng nhập.");
      }
      return getUser(user.id);
    },
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert severity="info">Không tìm thấy người dùng đang đăng nhập.</Alert>
      </Container>
    );
  }

  if (query.isPending) {
    return (
      <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Đang tải hồ sơ" />
      </Box>
    );
  }

  if (query.isError) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Thử lại
            </Button>
          }
        >
          {getAuthApiError(query.error).message}
        </Alert>
      </Container>
    );
  }

  if (!query.data) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert severity="info">Không tìm thấy hồ sơ người dùng.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Hồ sơ của tôi
        </Typography>
        <ProfileEditor profile={query.data} email={user?.email ?? ""} />
        <ChangePasswordForm />
      </Stack>
    </Container>
  );
}

function ProfileEditor({
  profile,
  email,
}: {
  profile: UserProfile;
  email: string;
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarServerError, setAvatarServerError] = useState<string | null>(
    null,
  );
  const [avatarFieldError, setAvatarFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: toProfileFormValues(profile),
  });
  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["user-profile", profile.id], updatedProfile);
      reset(toProfileFormValues(updatedProfile));
      setServerError(null);
      setSuccessMessage("Đã cập nhật hồ sơ.");
    },
    onError: (error: unknown) => {
      const apiError = getAuthApiError(error);
      setServerError(apiError.message);
      setSuccessMessage(null);

      for (const [field, messages] of Object.entries(apiError.errors)) {
        const formField = profileFields[field.toLowerCase()];
        if (formField && messages.length > 0) {
          setError(formField, {
            type: "server",
            message: messages.join(" "),
          });
        }
      }
    },
  });
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async ({ avatarUrl }) => {
      queryClient.setQueryData<UserProfile>(
        ["user-profile", profile.id],
        (currentProfile) =>
          currentProfile ? { ...currentProfile, avatarUrl } : currentProfile,
      );
      setAvatarServerError(null);
      setAvatarFieldError(null);
      await queryClient.invalidateQueries({
        queryKey: ["user-profile", profile.id],
      });
    },
    onError: (error: unknown) => {
      const apiError = getAuthApiError(error);
      setAvatarServerError(apiError.message);
      setAvatarFieldError(apiError.errors.file?.join(" ") ?? null);
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    const request: UpdateMeRequest = {
      fullName: values.fullName.trim(),
    };

    if (profile.role === "Student") {
      request.universityId = values.universityId
        ? Number(values.universityId)
        : null;
      request.major = values.major.trim() || null;
      request.githubUrl = values.githubUrl.trim() || null;
      request.linkedInUrl = values.linkedInUrl.trim() || null;
    }

    updateMutation.mutate(request);
  };

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, display: "grid", gap: 2 }}
    >
      <Typography variant="h6" component="h2">
        Thông tin cá nhân
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Avatar
          src={getAvatarSrc(profile.avatarUrl)}
          alt={`Ảnh đại diện ${profile.fullName}`}
          sx={{ width: 88, height: 88 }}
        />
        <Box>
          <Button
            component="label"
            variant="outlined"
            disabled={avatarMutation.isPending}
          >
            {avatarMutation.isPending ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setAvatarServerError(null);
                  setAvatarFieldError(null);
                  avatarMutation.mutate(file);
                }
                event.target.value = "";
              }}
            />
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Chấp nhận ảnh JPEG hoặc PNG, tối đa 5 MB.
          </Typography>
          {avatarServerError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {avatarServerError}
            </Alert>
          )}
          {avatarFieldError && (
            <Typography role="alert" color="error" variant="body2" sx={{ mt: 1 }}>
              {avatarFieldError}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: "grid", gap: 2 }}
      >
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        <TextField label="Email" value={email} disabled />
        <TextField
          label="Họ và tên"
          required
          {...register("fullName", {
            required: "Họ tên là bắt buộc.",
            validate: (value) =>
              Boolean(value.trim()) || "Họ tên là bắt buộc.",
          })}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName?.message}
        />

        {profile.role === "Student" && (
          <>
            <TextField
              label="Mã trường"
              type="number"
              {...register("universityId", {
                validate: (value) =>
                  !value ||
                  (Number.isInteger(Number(value)) && Number(value) > 0) ||
                  "Mã trường phải là số nguyên dương.",
              })}
              error={Boolean(errors.universityId)}
              helperText={errors.universityId?.message}
            />
            <TextField
              label="Chuyên ngành"
              {...register("major", {
                maxLength: {
                  value: 100,
                  message: "Chuyên ngành không được vượt quá 100 ký tự.",
                },
              })}
              error={Boolean(errors.major)}
              helperText={errors.major?.message}
            />
            <TextField
              label="GitHub URL"
              {...register("githubUrl", {
                maxLength: {
                  value: 300,
                  message: "GitHub URL không được vượt quá 300 ký tự.",
                },
              })}
              error={Boolean(errors.githubUrl)}
              helperText={errors.githubUrl?.message}
            />
            <TextField
              label="LinkedIn URL"
              {...register("linkedInUrl", {
                maxLength: {
                  value: 300,
                  message: "LinkedIn URL không được vượt quá 300 ký tự.",
                },
              })}
              error={Boolean(errors.linkedInUrl)}
              helperText={errors.linkedInUrl?.message}
            />
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </Box>
    </Paper>
  );
}

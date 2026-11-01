import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import LocationPicker, { type LatLng } from "./LocationPicker";
import {
  createProject,
  getProjectById,
  updateProject,
  type ProjectDetailDto,
  type ProjectType,
  type UpdateProjectRequest,
} from "../../api/projectsApi";

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;
  const projectId = Number(id);
  const hasValidProjectId =
    isEditMode &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(projectId) &&
    projectId > 0;
  const projectQuery = useQuery({
    queryKey: ["project-detail", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: hasValidProjectId,
  });

  if (isEditMode && !hasValidProjectId) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert severity="error">Mã dự án không hợp lệ.</Alert>
      </Box>
    );
  }

  if (isEditMode && projectQuery.isPending) {
    return (
      <Box
        sx={{
          minHeight: 240,
          display: "grid",
          placeItems: "center",
          p: 3,
        }}
      >
        <CircularProgress aria-label="Đang tải dự án" />
      </Box>
    );
  }

  if (isEditMode && projectQuery.isError) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => projectQuery.refetch()}
            >
              Thử lại
            </Button>
          }
        >
          Không thể tải dự án để chỉnh sửa.
        </Alert>
      </Box>
    );
  }

  if (isEditMode && !projectQuery.data) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert severity="info">Không tìm thấy dự án.</Alert>
      </Box>
    );
  }

  return (
    <ProjectEditorForm
      key={projectQuery.data?.id ?? "new-project"}
      project={projectQuery.data ?? undefined}
    />
  );
}

function ProjectEditorForm({ project }: { project?: ProjectDetailDto }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = project !== undefined;
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [type, setType] = useState<ProjectType>(project?.type ?? "Web");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [position, setPosition] = useState<LatLng | null>(
    project
      ? { latitude: project.latitude, longitude: project.longitude }
      : null,
  );
  const createMutation = useMutation({ mutationFn: createProject });
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      updateProject(project?.id ?? 0, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
      await queryClient.invalidateQueries({
        queryKey: ["project-detail", project?.id],
      });
      navigate("/my-projects", { state: { projectUpdated: true } });
    },
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!title.trim() || !position) return;
    if (project) {
      updateMutation.mutate({
        title,
        description,
        type,
        githubUrl,
        latitude: position.latitude,
        longitude: position.longitude,
      });
      return;
    }

    createMutation.mutate({
      title,
      description,
      type,
      githubUrl,
      latitude: position.latitude,
      longitude: position.longitude,
      tags: [],
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3, display: "grid", gap: 2 }}>
      <Typography variant="h5">
        {isEditMode ? "Chỉnh sửa dự án" : "Thả ghim dự án"}
      </Typography>

      <TextField
        label="Tên dự án"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Mô tả"
        multiline
        minRows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        select
        label="Loại dự án"
        value={type}
        onChange={(e) => setType(e.target.value as ProjectType)}
      >
        {["Web", "Mobile", "Game", "AI", "Other"].map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Link GitHub"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <Typography variant="subtitle2">Bấm lên bản đồ để chọn vị trí</Typography>
      <LocationPicker value={position} onChange={setPosition} />
      {position && (
        <Typography variant="caption">
          Vị trí: {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!title.trim() || !position || isPending}
      >
        {isPending ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thả ghim"}
      </Button>
      {createMutation.isError && (
        <Alert severity="error">Không thể tạo dự án. Vui lòng thử lại.</Alert>
      )}
      {updateMutation.isError && (
        <Alert severity="error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Không thể cập nhật dự án. Vui lòng thử lại."}
        </Alert>
      )}
      {createMutation.isSuccess && (
        <Typography color="success.main">
          Đã tạo dự án "{createMutation.data.title}" (id{" "}
          {createMutation.data.id})
        </Typography>
      )}
    </Box>
  );
}

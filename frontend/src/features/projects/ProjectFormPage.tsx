import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProject,
  deleteProjectImage,
  getProjectById,
  updateProject,
  uploadProjectImage,
  type CreateProjectRequest,
  type ProjectDetailDto,
  type ProjectType,
  type UpdateProjectRequest,
} from "../../api/projectsApi";
import { getTags } from "../../api/tagsApi";
import { getUniversities } from "../../api/universitiesApi";
import LocationPicker, { type LatLng } from "./LocationPicker";

type SelectedImage = { file: File; previewUrl: string };
type FormErrors = {
  title: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
};

function getTitleError(value: string) {
  if (!value.trim()) return "Vui lòng nhập tên dự án.";
  if (value.length > 200) return "Tên dự án tối đa 200 ký tự.";
  return "";
}

function getUrlError(value: string, label: string) {
  if (value && !/^https?:\/\//.test(value)) {
    return `${label} phải bắt đầu bằng http:// hoặc https://.`;
  }
  return "";
}

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
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl ?? "");
  const [addressText, setAddressText] = useState(project?.addressText ?? "");
  const [universityId, setUniversityId] = useState<number | undefined>(
    project?.universityId ?? undefined,
  );
  const [tagIds, setTagIds] = useState<number[]>(
    project?.tags.map((tag) => tag.id) ?? [],
  );
  const [position, setPosition] = useState<LatLng | null>(
    project
      ? { latitude: project.latitude, longitude: project.longitude }
      : null,
  );
  const [positionError, setPositionError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    title: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
  });
  const [existingImages, setExistingImages] = useState(project?.images ?? []);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  const [imageError, setImageError] = useState("");
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: getTags });
  const universitiesQuery = useQuery({
    queryKey: ["universities"],
    queryFn: getUniversities,
  });

  const replaceSelectedImages = (images: SelectedImage[]) => {
    selectedImagesRef.current = images;
    setSelectedImages(images);
  };

  useEffect(
    () => () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  const uploadSelectedImages = async (projectId: number) => {
    for (const image of selectedImages) {
      await uploadProjectImage(projectId, image.file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      const createdProject = await createProject(data);
      await uploadSelectedImages(createdProject.id);
      return createdProject;
    },
    onSuccess: async (createdProject) => {
      await queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
      navigate(`/projects/${createdProject.id}`);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProjectRequest) => {
      if (!project) {
        throw new Error("Không tìm thấy dự án cần cập nhật.");
      }
      const updatedProject = await updateProject(project.id, data);
      await uploadSelectedImages(updatedProject.id);
      return updatedProject;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
      await queryClient.invalidateQueries({
        queryKey: ["project-detail", project?.id],
      });
      navigate("/my-projects", { state: { projectUpdated: true } });
    },
  });
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => {
      if (!project) {
        throw new Error("Không tìm thấy dự án cần xóa ảnh.");
      }
      return deleteProjectImage(project.id, imageId);
    },
    onSuccess: (_data, imageId) => {
      setExistingImages((images) =>
        images.filter((image) => image.id !== imageId),
      );
      setImageError("");
    },
    onError: () => {
      setImageError("Không thể xóa ảnh. Vui lòng thử lại.");
    },
  });
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteImageMutation.isPending;

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length === 0) return;

    const isValidFile = files.every(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024,
    );
    if (!isValidFile) {
      setImageError("Ảnh phải là JPEG, PNG hoặc WebP và không quá 5 MB.");
      return;
    }

    if (existingImages.length + selectedImages.length + files.length > 5) {
      setImageError("Mỗi dự án được chọn tối đa 5 ảnh.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    replaceSelectedImages([...selectedImages, ...newImages]);
    setImageError("");
  };

  const removeSelectedImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    replaceSelectedImages(
      selectedImagesRef.current.filter(
        (image) => image.previewUrl !== previewUrl,
      ),
    );
    setImageError("");
  };

  const handleUseCurrentLocation = () => {
    setPositionError("");
    if (!navigator.geolocation) {
      setPositionError("Trình duyệt không hỗ trợ lấy vị trí.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setPositionError("Không thể lấy vị trí. Hãy kiểm tra quyền truy cập.");
        setIsLocating(false);
      },
    );
  };

  const validateForm = () => {
    const errors: FormErrors = {
      title: getTitleError(title),
      description:
        description.length > 5000 ? "Mô tả tối đa 5000 ký tự." : "",
      githubUrl: getUrlError(githubUrl, "Link GitHub"),
      demoUrl: getUrlError(demoUrl, "Link demo"),
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = () => {
    if (!validateForm() || !position) return;

    const data: CreateProjectRequest = {
      title,
      description,
      type,
      latitude: position.latitude,
      longitude: position.longitude,
      addressText: addressText || undefined,
      universityId,
      githubUrl: githubUrl || undefined,
      demoUrl: demoUrl || undefined,
      tagIds,
    };

    if (project) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        display: "grid",
        gap: 2,
      }}
    >
      <Typography variant="h5">
        {isEditMode ? "Chỉnh sửa dự án" : "Thả ghim dự án"}
      </Typography>

      <Typography variant="subtitle2">Thông tin dự án</Typography>
      <TextField
        label="Tên dự án"
        required
        value={title}
        error={Boolean(formErrors.title)}
        helperText={formErrors.title}
        slotProps={{ htmlInput: { maxLength: 200 } }}
        onBlur={() =>
          setFormErrors((errors) => ({
            ...errors,
            title: getTitleError(title),
          }))
        }
        onChange={(event) => {
          const value = event.target.value;
          setTitle(value);
          setFormErrors((errors) => ({
            ...errors,
            title: getTitleError(value),
          }));
        }}
      />
      <TextField
        label="Mô tả"
        multiline
        minRows={3}
        value={description}
        error={Boolean(formErrors.description)}
        helperText={formErrors.description}
        slotProps={{ htmlInput: { maxLength: 5000 } }}
        onChange={(event) => {
          const value = event.target.value;
          setDescription(value);
          setFormErrors((errors) => ({
            ...errors,
            description:
              value.length > 5000 ? "Mô tả tối đa 5000 ký tự." : "",
          }));
        }}
      />
      <TextField
        select
        label="Loại dự án"
        value={type}
        onChange={(event) => setType(event.target.value as ProjectType)}
      >
        {["Web", "Mobile", "Game", "AI", "Other"].map((projectType) => (
          <MenuItem key={projectType} value={projectType}>
            {projectType}
          </MenuItem>
        ))}
      </TextField>
      <Autocomplete
        multiple
        options={tagsQuery.data ?? []}
        value={(tagsQuery.data ?? []).filter((tag) => tagIds.includes(tag.id))}
        getOptionLabel={(tag) => tag.name}
        loading={tagsQuery.isPending}
        onChange={(_, tags) => setTagIds(tags.map((tag) => tag.id))}
        renderInput={(params) => (
          <TextField {...params} label="Thẻ kỹ năng" />
        )}
      />
      {tagsQuery.isError && (
        <FormHelperText error>Không thể tải danh sách thẻ kỹ năng.</FormHelperText>
      )}
      <TextField
        select
        label="Trường đại học"
        value={universityId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          setUniversityId(value === "" ? undefined : Number(value));
        }}
      >
        <MenuItem value="">Không chọn</MenuItem>
        {(universitiesQuery.data ?? []).map((university) => (
          <MenuItem key={university.id} value={university.id}>
            {university.name}
          </MenuItem>
        ))}
      </TextField>
      {universitiesQuery.isError && (
        <FormHelperText error>Không thể tải danh sách trường đại học.</FormHelperText>
      )}
      <TextField
        label="Địa chỉ (chữ)"
        value={addressText}
        slotProps={{ htmlInput: { maxLength: 300 } }}
        helperText={`${addressText.length}/300`}
        onChange={(event) => setAddressText(event.target.value)}
      />

      <Typography variant="subtitle2">Liên kết dự án</Typography>
      <TextField
        label="Link GitHub"
        value={githubUrl}
        error={Boolean(formErrors.githubUrl)}
        helperText={formErrors.githubUrl}
        onChange={(event) => {
          const value = event.target.value;
          setGithubUrl(value);
          setFormErrors((errors) => ({
            ...errors,
            githubUrl: getUrlError(value, "Link GitHub"),
          }));
        }}
      />
      <TextField
        label="Link demo"
        value={demoUrl}
        error={Boolean(formErrors.demoUrl)}
        helperText={formErrors.demoUrl}
        onChange={(event) => {
          const value = event.target.value;
          setDemoUrl(value);
          setFormErrors((errors) => ({
            ...errors,
            demoUrl: getUrlError(value, "Link demo"),
          }));
        }}
      />

      <Typography variant="subtitle2">Ảnh dự án</Typography>
      <Button component="label" variant="outlined" disabled={isPending}>
        Chọn ảnh
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageSelection}
        />
      </Button>
      <FormHelperText>
        Tối đa 5 ảnh JPEG, PNG hoặc WebP, mỗi ảnh không quá 5 MB.
      </FormHelperText>
      {imageError && <FormHelperText error>{imageError}</FormHelperText>}
      {existingImages.length > 0 && (
        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography variant="body2">Ảnh hiện có</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 2,
            }}
          >
            {existingImages.map((image) => (
              <Box key={image.id} sx={{ display: "grid", gap: 1 }}>
                <Box
                  component="img"
                  src={image.imageUrl}
                  alt="Ảnh dự án hiện có"
                  sx={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
                <Button
                  color="error"
                  size="small"
                  disabled={isPending}
                  onClick={() => deleteImageMutation.mutate(image.id)}
                >
                  Xóa ảnh
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {selectedImages.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 2,
          }}
        >
          {selectedImages.map((image) => (
            <Box key={image.previewUrl} sx={{ display: "grid", gap: 1 }}>
              <Box
                component="img"
                src={image.previewUrl}
                alt={`Ảnh xem trước ${image.file.name}`}
                sx={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
              <Button
                color="error"
                size="small"
                disabled={isPending}
                onClick={() => removeSelectedImage(image.previewUrl)}
              >
                Xóa ảnh
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Typography variant="subtitle2">Vị trí dự án</Typography>
      <Button
        variant="outlined"
        onClick={handleUseCurrentLocation}
        disabled={isLocating || isPending}
      >
        {isLocating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
      </Button>
      <FormHelperText>
        Vị trí này chỉ dùng cho dự án, không theo dõi bạn.
      </FormHelperText>
      {positionError && <Alert severity="error">{positionError}</Alert>}
      <Typography variant="subtitle2">Bấm lên bản đồ để chọn vị trí</Typography>
      <LocationPicker
        value={position}
        onChange={(value) => {
          setPosition(value);
          setPositionError("");
        }}
      />
      {position && (
        <Typography variant="caption">
          Vị trí: {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!position || isPending}
      >
        {isPending ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thả ghim"}
      </Button>
      {createMutation.isError && (
        <Alert severity="error">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : "Không thể tạo dự án hoặc tải ảnh. Vui lòng thử lại."}
        </Alert>
      )}
      {updateMutation.isError && (
        <Alert severity="error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Không thể cập nhật dự án. Vui lòng thử lại."}
        </Alert>
      )}
    </Box>
  );
}

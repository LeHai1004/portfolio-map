import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink, useParams } from "react-router-dom";
import { removeSavedProject, saveProject } from "../../api/savedProjectsApi";
import { getProjectById, type ProjectType } from "../../api/projectsApi";
import ContactStudentDialog from "../company/ContactStudentDialog";

type IconName =
  | "project"
  | "person"
  | "school"
  | "github"
  | "external"
  | "bookmark"
  | "bookmarkFilled"
  | "mail";

function DetailIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    project:
      "M4 4h16v16H4z M8 8h8v2H8z M8 12h8v2H8z M8 16h5v2H8z",
    person:
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z",
    school:
      "m12 3 10 5-10 5L2 8l10-5Zm-6 8.2 6 3 6-3V16l-6 3-6-3v-4.8ZM20 10h2v7h-2z",
    github:
      "M4 5h16v14H4z M7 9l3 3-3 3m5 0h5",
    external:
      "M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z",
    bookmark:
      "M17 3H7a2 2 0 0 0-2 2v17l7-3 7 3V5a2 2 0 0 0-2-2Zm0 16-5-2.18L7 19V5h10v14Z",
    bookmarkFilled:
      "M17 3H7a2 2 0 0 0-2 2v17l7-3 7 3V5a2 2 0 0 0-2-2Z",
    mail:
      "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
  };

  return (
    <SvgIcon fontSize="small" aria-hidden="true">
      <path d={paths[name]} />
    </SvgIcon>
  );
}

function ProjectTypeIcon({
  type,
  size = 44,
}: {
  type: ProjectType;
  size?: number;
}) {
  const paths: Record<ProjectType, string> = {
    Web: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.9 9h-3.02a15.7 15.7 0 0 0-1.35-6.02A8.02 8.02 0 0 1 19.9 11ZM12 4c.95 1.37 1.66 3.95 1.87 7h-3.74c.21-3.05.92-5.63 1.87-7ZM4.1 13h3.02c.18 2.24.66 4.3 1.35 6.02A8.02 8.02 0 0 1 4.1 13Zm3.02-2H4.1a8.02 8.02 0 0 1 4.37-6.02A15.7 15.7 0 0 0 7.12 11ZM12 20c-.95-1.37-1.66-3.95-1.87-7h3.74c-.21 3.05-.92 5.63-1.87 7Zm3.53-.98A15.7 15.7 0 0 0 16.88 13h3.02a8.02 8.02 0 0 1-4.37 6.02Z",
    Mobile:
      "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v13h10V5H7Zm4 14h2v1h-2z",
    Game:
      "M7 7h10a5 5 0 0 1 4.8 6.4l-1 3.5a2.5 2.5 0 0 1-4.1 1.1L14.8 16H9.2l-1.9 2a2.5 2.5 0 0 1-4.1-1.1l-1-3.5A5 5 0 0 1 7 7Zm1 3H6v2H4v2h2v2h2v-2h2v-2H8v-2Zm8 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
    AI: "M12 2 14.2 9.8 22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Zm7 14 .9 3.1L23 20l-3.1.9L19 24l-.9-3.1L15 20l3.1-.9L19 16Z",
    Other:
      "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 13h-2v-2h2v2Zm0-4h-2V7h2v5Z",
  };

  return (
    <SvgIcon sx={{ fontSize: size, flexShrink: 0 }} aria-hidden="true">
      <path d={paths[type]} />
    </SvgIcon>
  );
}

function ProjectDetailSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={320} />
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 4 } }}>
          <Skeleton width="35%" height={32} />
          <Skeleton width="70%" height={48} />
          <Skeleton width="45%" />
          <Skeleton variant="rounded" height={90} />
          <Skeleton width="60%" />
        </Stack>
      </Paper>
    </Container>
  );
}

function ProjectNotFound() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Alert
        severity="info"
        action={
          <Button component={RouterLink} to="/" color="inherit" size="small">
            Về bản đồ
          </Button>
        }
      >
        Không tìm thấy dự án.
      </Alert>
    </Container>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const theme = useTheme();
  const [savedProjectId, setSavedProjectId] = useState<number | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const projectId = Number(id);
  const isSaved = savedProjectId === projectId;
  const hasValidId =
    id !== undefined &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(projectId) &&
    projectId > 0;
  const query = useQuery({
    queryKey: ["project-detail", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: hasValidId,
  });
  const saveMutation = useMutation({
    mutationFn: (shouldSave: boolean) =>
      shouldSave ? saveProject(projectId) : removeSavedProject(projectId),
    onSuccess: (_result, shouldSave) =>
      setSavedProjectId(shouldSave ? projectId : null),
    onError: () =>
      setNotice({
        message: "Không thể cập nhật trạng thái lưu dự án. Vui lòng thử lại.",
        severity: "error",
      }),
  });

  if (!hasValidId) {
    return <ProjectNotFound />;
  }

  if (query.isPending) {
    return <ProjectDetailSkeleton />;
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
          Không thể tải thông tin dự án. Vui lòng thử lại.
        </Alert>
      </Container>
    );
  }

  const project = query.data;
  if (!project) {
    return <ProjectNotFound />;
  }

  const imageUrl = project.thumbnailUrl ?? project.images[0]?.imageUrl;
  const sectionSx = (index: number) => ({
    animation: "project-detail-section-enter 250ms ease-out both",
    animationDelay: `${index * 40}ms`,
  });

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 3, sm: 5 },
        "@keyframes project-detail-section-enter": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .project-detail-section": { animation: "none" },
        },
      }}
    >
      <Paper
        className="project-detail-card"
        variant="outlined"
        sx={{
          overflow: "hidden",
          transition: "transform 180ms ease",
          "&:hover": { transform: "translateY(-3px)" },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:hover": { transform: "none" },
          },
        }}
      >
        <Box
          className="project-detail-section"
          sx={{
            ...sectionSx(0),
            position: "relative",
            display: "grid",
            placeItems: "center",
            height: { xs: 220, sm: 360 },
            overflow: "hidden",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
            color: "primary.main",
          }}
        >
          <Box
            sx={{
              gridArea: "1 / 1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
            }}
          >
            <ProjectTypeIcon type={project.type} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {project.type}
            </Typography>
          </Box>
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={`Ảnh dự án ${project.title}`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              sx={{
                gridArea: "1 / 1",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </Box>

        <Stack spacing={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box
            className="project-detail-section"
            sx={{
              ...sectionSx(1),
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<ProjectTypeIcon type={project.type} size={16} />}
              label={project.type}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                "& .MuiChip-icon": { color: "inherit", fontSize: 16 },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {project.viewCount.toLocaleString("vi-VN")} lượt xem
            </Typography>
          </Box>

          <Typography
            className="project-detail-section"
            variant="h3"
            component="h1"
            sx={{ ...sectionSx(2), fontWeight: 700 }}
          >
            {project.title}
          </Typography>

          {project.description && (
            <Typography
              className="project-detail-section"
              color="text.secondary"
              sx={{ ...sectionSx(3), whiteSpace: "pre-line" }}
            >
              {project.description}
            </Typography>
          )}

          {project.tags.length > 0 && (
            <Box
              className="project-detail-section"
              sx={{ ...sectionSx(4), display: "flex", gap: 1, flexWrap: "wrap" }}
            >
              {project.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                    color: "text.primary",
                  }}
                />
              ))}
            </Box>
          )}

          <Box
            className="project-detail-section"
            sx={{
              ...sectionSx(5),
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <MetadataBlock
              icon="person"
              label="Chủ dự án"
              value={project.owner.fullName}
            />
            {project.universityName && (
              <MetadataBlock
                icon="school"
                label="Trường"
                value={project.universityName}
              />
            )}
          </Box>

          <Box
            className="project-detail-section"
            sx={{
              ...sectionSx(6),
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {project.githubUrl && (
              <Button
                component="a"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="primary"
                startIcon={<DetailIcon name="github" />}
              >
                Xem mã nguồn GitHub
              </Button>
            )}
            {project.demoUrl && (
              <Button
                component="a"
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="primary"
                startIcon={<DetailIcon name="external" />}
              >
                Xem demo
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              aria-pressed={isSaved}
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate(!isSaved)}
              startIcon={
                <DetailIcon
                  name={isSaved ? "bookmarkFilled" : "bookmark"}
                />
              }
              sx={{
                transition: "transform 150ms ease",
                "&:active": { transform: "scale(0.98)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:active": { transform: "none" },
                },
              }}
            >
              {isSaved ? "Đã lưu" : "Lưu dự án"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DetailIcon name="mail" />}
              onClick={() => setContactDialogOpen(true)}
              sx={{
                transition: "transform 150ms ease",
                "&:active": { transform: "scale(0.98)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:active": { transform: "none" },
                },
              }}
            >
              Liên hệ sinh viên
            </Button>
          </Box>
        </Stack>
      </Paper>
      <ContactStudentDialog
        open={contactDialogOpen}
        projectId={project.id}
        onClose={() => setContactDialogOpen(false)}
        onSent={() =>
          setNotice({ message: "Đã gửi lời nhắn", severity: "success" })
        }
      />
      {notice && (
        <Snackbar
          open
          autoHideDuration={5000}
          onClose={() => setNotice(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={notice.severity}
            variant="filled"
            onClose={() => setNotice(null)}
          >
            {notice.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}

function MetadataBlock({
  icon,
  label,
  value,
}: {
  icon: "person" | "school";
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 40,
          height: 40,
          borderRadius: 2,
          color: "primary.main",
          bgcolor: "background.paper",
        }}
      >
        <DetailIcon name={icon} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

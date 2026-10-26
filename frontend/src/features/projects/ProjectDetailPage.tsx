import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getProjectById } from "../../api/projectsApi";

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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
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

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 3, sm: 5 },
        animation: "project-detail-enter 220ms ease-out both",
        "@keyframes project-detail-enter": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    >
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            height: { xs: 220, sm: 360 },
            bgcolor: "action.hover",
          }}
        >
          {imageUrl ? (
            <>
              <Typography color="text.secondary" sx={{ gridArea: "1 / 1" }}>
                Ảnh dự án chưa tải được
              </Typography>
              <Box
                component="img"
                src={imageUrl}
                alt={`Ảnh dự án ${project.title}`}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
                sx={{
                  gridArea: "1 / 1",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </>
          ) : (
            <Typography color="text.secondary">Chưa có ảnh dự án</Typography>
          )}
        </Box>

        <Stack spacing={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1,
            }}
          >
            <Chip label={project.type} color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              {project.viewCount.toLocaleString("vi-VN")} lượt xem
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            {project.title}
          </Typography>

          {project.description && (
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              {project.description}
            </Typography>
          )}

          {project.tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {project.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" />
              ))}
            </Box>
          )}

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Chủ dự án
            </Typography>
            <Typography>{project.owner.fullName}</Typography>
          </Stack>

          {project.universityName && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Trường
              </Typography>
              <Typography>{project.universityName}</Typography>
            </Stack>
          )}

          {(project.githubUrl || project.demoUrl) && (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {project.githubUrl && (
                <MuiLink
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem mã nguồn trên GitHub
                </MuiLink>
              )}
              {project.demoUrl && (
                <MuiLink
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem bản demo
                </MuiLink>
              )}
            </Box>
          )}
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

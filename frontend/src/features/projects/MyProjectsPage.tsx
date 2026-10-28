import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  deleteProject,
  getMyProjects,
  type ProjectDetailDto,
} from "../../api/projectsApi";

function MyProjectsSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap: 3,
      }}
    >
      {[0, 1].map((item) => (
        <Card key={item} variant="outlined">
          <Skeleton variant="rectangular" height={180} />
          <CardContent>
            <Skeleton width="65%" height={32} />
            <Skeleton width="35%" />
          </CardContent>
          <CardActions>
            <Skeleton width={180} height={36} />
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

export default function MyProjectsPage() {
  const queryClient = useQueryClient();
  const [projectToDelete, setProjectToDelete] =
    useState<ProjectDetailDto | null>(null);
  const query = useQuery({
    queryKey: ["projects", "mine"],
    queryFn: getMyProjects,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      setProjectToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
      await queryClient.invalidateQueries({ queryKey: ["project-detail"] });
    },
  });

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Dự án của tôi
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Quản lý các dự án bạn đã chia sẻ trên bản đồ.
          </Typography>
        </Box>

        {deleteMutation.isError && (
          <Alert severity="error">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Không thể xóa dự án. Vui lòng thử lại."}
          </Alert>
        )}

        {query.isPending ? (
          <MyProjectsSkeleton />
        ) : query.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => query.refetch()}
              >
                Thử lại
              </Button>
            }
          >
            Không thể tải danh sách dự án. Vui lòng thử lại.
          </Alert>
        ) : query.data.length === 0 ? (
          <Card variant="outlined">
            <CardContent sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="h6">Bạn chưa có dự án nào</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Hãy thả ghim để chia sẻ dự án đầu tiên.
              </Typography>
              <Button
                component={RouterLink}
                to="/projects/new"
                variant="contained"
              >
                Tạo dự án
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {query.data.map((project, index) => (
              <Card
                key={project.id}
                variant="outlined"
                sx={{
                  overflow: "hidden",
                  animation: "my-project-enter 250ms ease-out both",
                  animationDelay: `${index * 40}ms`,
                  transition: "transform 180ms ease",
                  "&:hover": { transform: "translateY(-3px)" },
                  "@keyframes my-project-enter": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                    transition: "none",
                    "&:hover": { transform: "none" },
                  },
                }}
              >
                {project.thumbnailUrl ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={project.thumbnailUrl}
                    alt={`Ảnh dự án ${project.title}`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "action.hover",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="h6">{project.type}</Typography>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" component="h2" noWrap>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.type}
                    {project.tags.length > 0 &&
                      ` · ${project.tags.map((tag) => tag.name).join(", ")}`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, flexWrap: "wrap" }}>
                  <Button
                    component={RouterLink}
                    to={`/projects/${project.id}`}
                    size="small"
                  >
                    Xem
                  </Button>
                  <Button size="small" disabled title="Chưa có chế độ sửa">
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      deleteMutation.reset();
                      setProjectToDelete(project);
                    }}
                  >
                    Xóa
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Stack>

      <Dialog
        open={projectToDelete !== null}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setProjectToDelete(null);
          }
        }}
        aria-labelledby="delete-project-title"
      >
        <DialogTitle id="delete-project-title">Xóa dự án?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xóa “{projectToDelete?.title}”? Thao tác này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProjectToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending || !projectToDelete}
            onClick={() => {
              if (projectToDelete) {
                deleteMutation.mutate(projectToDelete.id);
              }
            }}
          >
            {deleteMutation.isPending ? "Đang xóa..." : "Xóa dự án"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keyframes } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import {
  setProjectStatus,
  setUserLocked,
  getAdminProjects,
  getAdminUsers,
  type AdminProjectDto,
  type AdminUserDto,
} from "../../api/adminApi";

const PAGE_SIZE_OPTIONS = [5, 10, 25];
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

type Confirmation =
  | { kind: "project"; item: AdminProjectDto }
  | { kind: "user"; item: AdminUserDto }
  | null;

function AdminTableSkeleton({ columns }: { columns: number }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }, (_, index) => (
              <TableCell key={index}>
                <Skeleton width="70%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[0, 1, 2, 3].map((row) => (
            <TableRow key={row}>
              {Array.from({ length: columns }, (_, column) => (
                <TableCell key={column}>
                  <Skeleton width={column === columns - 1 ? 88 : "75%"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [projectPage, setProjectPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [projectPageSize, setProjectPageSize] = useState(10);
  const [userPageSize, setUserPageSize] = useState(10);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["admin", "projects", projectPage, projectPageSize],
    queryFn: () =>
      getAdminProjects({ page: projectPage + 1, pageSize: projectPageSize }),
    enabled: tab === 0,
  });
  const usersQuery = useQuery({
    queryKey: ["admin", "users", userPage, userPageSize],
    queryFn: () =>
      getAdminUsers({ page: userPage + 1, pageSize: userPageSize }),
    enabled: tab === 1,
  });

  const projectMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: AdminProjectDto["status"];
    }) => setProjectStatus(id, status),
    onSuccess: async (project) => {
      setConfirmation(null);
      setSnackbarMessage(
        project.status === "Hidden" ? "Đã ẩn dự án." : "Đã hiện dự án.",
      );
      await queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
  const userMutation = useMutation({
    mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) =>
      setUserLocked(id, isLocked),
    onSuccess: async (user) => {
      setConfirmation(null);
      setSnackbarMessage(
        user.isLocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
      );
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const isMutating = projectMutation.isPending || userMutation.isPending;
  const mutationError = projectMutation.error ?? userMutation.error;

  const confirmAction = () => {
    if (confirmation?.kind === "project") {
      projectMutation.mutate({
        id: confirmation.item.id,
        status: confirmation.item.status === "Active" ? "Hidden" : "Active",
      });
    } else if (confirmation?.kind === "user") {
      userMutation.mutate({
        id: confirmation.item.id,
        isLocked: !confirmation.item.isLocked,
      });
    }
  };

  const closeConfirmation = () => {
    if (!isMutating) {
      setConfirmation(null);
      projectMutation.reset();
      userMutation.reset();
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, sm: 5 },
        animation: `${fadeIn} 200ms ease-out`,
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Quản trị
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Quản lý dự án và tài khoản trên Portfolio Map.
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          aria-label="Danh mục quản trị"
        >
          <Tab label="Dự án" />
          <Tab label="Tài khoản" />
        </Tabs>

        {mutationError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  projectMutation.reset();
                  userMutation.reset();
                }}
              >
                Đóng
              </Button>
            }
          >
            {mutationError instanceof Error
              ? mutationError.message
              : "Không thể cập nhật. Vui lòng thử lại."}
          </Alert>
        )}

        {tab === 0 ? (
          projectsQuery.isPending ? (
            <AdminTableSkeleton columns={7} />
          ) : projectsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => projectsQuery.refetch()}
                >
                  Thử lại
                </Button>
              }
            >
              Không thể tải danh sách dự án. Vui lòng thử lại.
            </Alert>
          ) : projectsQuery.data ? (
            <AdminProjectsTable
              data={projectsQuery.data.items}
              totalItems={projectsQuery.data.totalItems}
              page={projectPage}
              pageSize={projectPageSize}
              onPageChange={setProjectPage}
              onPageSizeChange={(size) => {
                setProjectPageSize(size);
                setProjectPage(0);
              }}
              onConfirm={(project) => {
                projectMutation.reset();
                setConfirmation({ kind: "project", item: project });
              }}
            />
          ) : (
            <Alert severity="error">Không có dữ liệu dự án để hiển thị.</Alert>
          )
        ) : usersQuery.isPending ? (
          <AdminTableSkeleton columns={6} />
        ) : usersQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => usersQuery.refetch()}
              >
                Thử lại
              </Button>
            }
          >
            Không thể tải danh sách tài khoản. Vui lòng thử lại.
          </Alert>
        ) : usersQuery.data ? (
          <AdminUsersTable
            data={usersQuery.data.items}
            totalItems={usersQuery.data.totalItems}
            page={userPage}
            pageSize={userPageSize}
            onPageChange={setUserPage}
            onPageSizeChange={(size) => {
              setUserPageSize(size);
              setUserPage(0);
            }}
            onConfirm={(user) => {
              userMutation.reset();
              setConfirmation({ kind: "user", item: user });
            }}
          />
        ) : (
          <Alert severity="error">Không có dữ liệu tài khoản để hiển thị.</Alert>
        )}
      </Stack>

      <Dialog
        open={confirmation !== null}
        onClose={closeConfirmation}
        aria-labelledby="admin-confirm-title"
      >
        <DialogTitle id="admin-confirm-title">
          {confirmation?.kind === "project"
            ? confirmation.item.status === "Active"
              ? "Ẩn dự án?"
              : "Hiện dự án?"
            : confirmation?.item.isLocked
              ? "Mở khóa tài khoản?"
              : "Khóa tài khoản?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmation?.kind === "project"
              ? `Bạn có chắc muốn ${
                  confirmation.item.status === "Active" ? "ẩn" : "hiện"
                } dự án “${confirmation.item.title}”?`
              : confirmation?.kind === "user"
                ? `Bạn có chắc muốn ${
                    confirmation.item.isLocked ? "mở khóa" : "khóa"
                  } tài khoản “${confirmation.item.fullName}”?`
                : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmation} disabled={isMutating}>
            Hủy
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={
              confirmation?.kind === "project"
                ? confirmation.item.status === "Active"
                  ? "warning"
                  : "success"
                : confirmation?.kind === "user" && !confirmation.item.isLocked
                  ? "error"
                  : "success"
            }
            disabled={isMutating}
          >
            {isMutating
              ? "Đang cập nhật..."
              : confirmation?.kind === "project"
                ? confirmation.item.status === "Active"
                  ? "Ẩn dự án"
                  : "Hiện dự án"
                : confirmation?.kind === "user" && confirmation.item.isLocked
                  ? "Mở khóa"
                  : "Khóa tài khoản"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarMessage.length > 0}
        autoHideDuration={4000}
        message={snackbarMessage}
        onClose={() => setSnackbarMessage("")}
      />
    </Container>
  );
}

function AdminProjectsTable({
  data,
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onConfirm,
}: {
  data: AdminProjectDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onConfirm: (project: AdminProjectDto) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 760 }} aria-label="Danh sách dự án">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Dự án</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Chủ sở hữu</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>{project.ownerName}</TableCell>
                <TableCell>{formatCreatedAt(project.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={project.status === "Active" ? "success" : "default"}
                    label={project.status === "Active" ? "Đang hiện" : "Đã ẩn"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={project.status === "Active" ? "warning" : "success"}
                    onClick={() => onConfirm(project)}
                  >
                    {project.status === "Active" ? "Ẩn" : "Hiện"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography
                    color="text.secondary"
                    sx={{ py: 4, textAlign: "center" }}
                  >
                    Chưa có dự án nào.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) =>
          onPageSizeChange(Number(event.target.value))
        }
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage="Số dòng:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} / ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
}

function AdminUsersTable({
  data,
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onConfirm,
}: {
  data: AdminUserDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onConfirm: (user: AdminUserDto) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 760 }} aria-label="Danh sách tài khoản">
          <TableHead>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Ngày tham gia</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{formatCreatedAt(user.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={user.isLocked ? "error" : "success"}
                    label={user.isLocked ? "Đã khóa" : "Đang hoạt động"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={user.isLocked ? "success" : "error"}
                    disabled={user.role === "Admin"}
                    onClick={() => onConfirm(user)}
                  >
                    {user.isLocked ? "Mở khóa" : "Khóa"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    color="text.secondary"
                    sx={{ py: 4, textAlign: "center" }}
                  >
                    Chưa có tài khoản nào.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) =>
          onPageSizeChange(Number(event.target.value))
        }
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage="Số dòng:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} / ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
}

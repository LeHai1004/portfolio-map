import { useState, type FormEvent } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  createComment,
  deleteComment,
  getComments,
  type CommentDto,
} from "../../api/interactionApi";
import { useAuth } from "../auth/authContextStore";

const CommentPageSize = 10;

function CommentListSkeleton() {
  return (
    <Stack spacing={1.5} aria-label="Đang tải bình luận">
      {[0, 1, 2].map((item) => (
        <Paper key={item} variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "flex-start" }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="35%" />
              <Skeleton width="90%" />
              <Skeleton width="65%" />
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function formatCommentDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CommentSection({
  projectId,
}: {
  projectId: number;
}) {
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [content, setContent] = useState("");
  const queryKey = ["interactions", "comments", projectId];
  const commentsQuery = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getComments(projectId, pageParam, CommentPageSize),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.totalItems
        ? lastPage.page + 1
        : undefined,
  });
  const createMutation = useMutation({
    mutationFn: () => createComment(projectId, { content }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || content.length > 1000 || createMutation.isPending) {
      return;
    }
    createMutation.mutate();
  }

  const comments =
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Stack component="section" spacing={2.5} aria-labelledby="comments-heading">
      <Typography id="comments-heading" variant="h5" component="h2">
        Bình luận
      </Typography>

      {user ? (
        <Box component="form" onSubmit={submitComment}>
          <Stack spacing={1}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Viết bình luận"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${content.length}/1000`}
            />
            {createMutation.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => createMutation.mutate()}
                  >
                    Thử lại
                  </Button>
                }
              >
                Không thể gửi bình luận.
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={
                !content.trim() ||
                content.length > 1000 ||
                createMutation.isPending
              }
              sx={{
                alignSelf: "flex-end",
                transition: "transform 180ms ease, opacity 180ms ease",
                "&:active": { transform: "scale(0.98)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:active": { transform: "none" },
                },
              }}
            >
              {createMutation.isPending ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Typography color="text.secondary">
          {isAuthLoading ? (
            <Skeleton width="55%" />
          ) : (
            <>
              Đăng nhập để bình luận.{" "}
              <MuiLink component={Link} to="/login">
                Đăng nhập
              </MuiLink>
            </>
          )}
        </Typography>
      )}

      {commentsQuery.isPending ? (
        <CommentListSkeleton />
      ) : commentsQuery.isError && !commentsQuery.data ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => commentsQuery.refetch()}
            >
              Thử lại
            </Button>
          }
        >
          Không thể tải bình luận.
        </Alert>
      ) : comments.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            Chưa có bình luận. Hãy bắt đầu cuộc trò chuyện.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={comment.author.id === user?.id}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === comment.id
              }
              onDelete={() => deleteMutation.mutate(comment.id)}
            />
          ))}
          {deleteMutation.isError && (
            <Alert
              severity="error"
              action={
                deleteMutation.variables !== undefined && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() =>
                      deleteMutation.mutate(deleteMutation.variables)
                    }
                  >
                    Thử lại
                  </Button>
                )
              }
            >
              Không thể xóa bình luận.
            </Alert>
          )}
          {commentsQuery.hasNextPage && (
            <Button
              variant="text"
              onClick={() => commentsQuery.fetchNextPage()}
              disabled={commentsQuery.isFetchingNextPage}
              sx={{ alignSelf: "center" }}
            >
              {commentsQuery.isFetchingNextPage
                ? "Đang tải..."
                : commentsQuery.isFetchNextPageError
                  ? "Thử lại"
                  : "Xem thêm"}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function CommentItem({
  comment,
  canDelete,
  isDeleting,
  onDelete,
}: {
  comment: CommentDto;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start" }}
      >
        <Avatar src={comment.author.avatarUrl ?? undefined} alt="">
          {comment.author.fullName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.5}
            sx={{ justifyContent: "space-between" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {comment.author.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCommentDate(comment.createdAt)}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ mt: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {comment.content}
          </Typography>
          {canDelete && (
            <Button
              color="error"
              size="small"
              onClick={onDelete}
              disabled={isDeleting}
              sx={{ mt: 0.5, px: 0 }}
              aria-label={`Xóa bình luận của ${comment.author.fullName}`}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

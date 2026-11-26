import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Skeleton, Stack, SvgIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { addLike, getLikeStatus, removeLike } from "../../api/interactionApi";
import { useAuth } from "../auth/authContextStore";

export default function LikeButton({ projectId }: { projectId: number }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ["interactions", "like", projectId, user?.id ?? null];
  const likeQuery = useQuery({
    queryKey,
    queryFn: () => getLikeStatus(projectId),
  });
  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) {
        await removeLike(projectId);
      } else {
        await addLike(projectId);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["interactions", "like", projectId] }),
  });

  if (likeQuery.isPending) {
    return <Skeleton variant="rounded" width={112} height={40} />;
  }

  if (likeQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => likeQuery.refetch()}
          >
            Thử lại
          </Button>
        }
      >
        Không thể tải lượt thích.
      </Alert>
    );
  }

  const liked = likeQuery.data.likedByMe;

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      <Button
        variant={liked ? "contained" : "outlined"}
        color={liked ? "error" : "primary"}
        aria-pressed={liked}
        disabled={likeMutation.isPending}
        onClick={() => {
          if (!user) {
            navigate("/login");
            return;
          }
          likeMutation.mutate(liked);
        }}
        startIcon={
          <SvgIcon
            aria-hidden="true"
            sx={{
              color: liked ? "inherit" : theme.palette.error.main,
              transition: "transform 180ms ease, opacity 180ms ease",
              transform: liked ? "scale(1.08)" : "scale(1)",
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z" />
          </SvgIcon>
        }
        sx={{
          transition: "transform 180ms ease, opacity 180ms ease",
          "&:active": { transform: "scale(0.97)" },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:active": { transform: "none" },
          },
        }}
      >
        {liked ? "Đã thích" : "Thích"} · {likeQuery.data.count}
      </Button>
      {likeMutation.isError && (
        <Alert
          severity="error"
          role="alert"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => likeMutation.mutate(liked)}
            >
              Thử lại
            </Button>
          }
        >
          Không thể cập nhật lượt thích.
        </Alert>
      )}
    </Stack>
  );
}

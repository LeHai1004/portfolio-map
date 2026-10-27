import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  ListItemButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  getInbox,
  markInboxMessageAsRead,
  type InboxMessageDto,
} from "../../api/contactsApi";

function InboxSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[0, 1, 2].map((item) => (
        <Paper key={item} variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="45%" />
              <Skeleton width="75%" />
              <Skeleton width="30%" />
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}

function formatMessageDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null,
  );
  const inboxQuery = useQuery({
    queryKey: ["contacts", "inbox"],
    queryFn: getInbox,
  });
  const markReadMutation = useMutation({
    mutationFn: markInboxMessageAsRead,
    onSuccess: async (message) => {
      if (!message) {
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["contacts", "inbox"],
      });
    },
  });

  if (inboxQuery.isPending) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Skeleton width="35%" height={42} sx={{ mb: 2 }} />
        <InboxSkeleton />
      </Container>
    );
  }

  if (inboxQuery.isError) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => inboxQuery.refetch()}
            >
              Thử lại
            </Button>
          }
        >
          Không thể tải hộp thư. Vui lòng thử lại.
        </Alert>
      </Container>
    );
  }

  const messages = inboxQuery.data;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Hộp thư
          </Typography>
          <Typography color="text.secondary">
            Lời nhắn từ các công ty
          </Typography>
        </Box>

        {messages.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}
          >
            <Typography variant="h6">Chưa có lời nhắn</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Khi có công ty liên hệ, lời nhắn sẽ xuất hiện tại đây.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {messages.map((message, index) => (
              <InboxMessage
                key={message.id}
                message={message}
                selected={selectedMessageId === message.id}
                onSelect={() =>
                  setSelectedMessageId((current) =>
                    current === message.id ? null : message.id,
                  )
                }
                onMarkRead={() => markReadMutation.mutate(message.id)}
                isMarkingRead={
                  markReadMutation.isPending &&
                  markReadMutation.variables === message.id
                }
                animationDelay={index * 40}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

function InboxMessage({
  message,
  selected,
  onSelect,
  onMarkRead,
  isMarkingRead,
  animationDelay,
}: {
  message: InboxMessageDto;
  selected: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
  isMarkingRead: boolean;
  animationDelay: number;
}) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        animation: "inbox-message-enter 250ms ease-out both",
        animationDelay: `${animationDelay}ms`,
        transition: "transform 180ms ease",
        "&:hover": { transform: "translateY(-2px)" },
        "@keyframes inbox-message-enter": {
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
      <ListItemButton
        onClick={onSelect}
        aria-expanded={selected}
        sx={{ p: 2, alignItems: "flex-start" }}
      >
        <Stack direction="row" spacing={2} sx={{ width: "100%", minWidth: 0 }}>
          <Avatar
            src={message.fromCompany.logoUrl ?? undefined}
            alt=""
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              fontWeight: 700,
            }}
          >
            {message.fromCompany.companyName.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: message.isRead ? 400 : 700 }}
              >
                {message.fromCompany.companyName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMessageDate(message.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!message.isRead && (
                <Box
                  aria-label="Chưa đọc"
                  sx={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
              )}
              <Typography
                variant="body1"
                sx={{ fontWeight: message.isRead ? 400 : 700 }}
              >
                {message.subject}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              Dự án: {message.projectTitle ?? "Không gắn với dự án"}
            </Typography>
          </Box>
        </Stack>
      </ListItemButton>

      {selected && (
        <Box
          sx={{
            px: 2,
            pb: 2,
            pl: { xs: 2, sm: 10 },
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography sx={{ pt: 2, whiteSpace: "pre-line" }}>
            {message.content}
          </Typography>
          {!message.isRead && (
            <Button
              variant="outlined"
              color="primary"
              onClick={onMarkRead}
              disabled={isMarkingRead}
              sx={{ mt: 2 }}
            >
              {isMarkingRead ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
}

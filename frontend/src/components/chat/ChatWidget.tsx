import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { Link as RouterLink } from "react-router-dom";
import {
  sendChat,
  type AiChatHistoryItem,
  type AiChatResponse,
} from "../../api/aiApi";
import { useAuth } from "../../features/auth/authContextStore";

type ChatMessage = AiChatHistoryItem & {
  projects?: AiChatResponse["projects"];
};

type ChatRequestPayload = {
  message: string;
  history: AiChatHistoryItem[];
};

type ChatMutationInput = ChatRequestPayload & {
  signal: AbortSignal;
};

type StoredChatState = {
  messages: ChatMessage[];
  isOpen: boolean;
};

const maxStoredMessages = 50;

const suggestedQuestions = [
  "Gợi ý cho tôi vài dự án mobile dùng Kotlin",
  "Có dự án AI nào dành cho người mới không?",
  "Tìm dự án web về giáo dục",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStoredProject(
  value: unknown,
): value is AiChatResponse["projects"][number] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.title === "string" &&
    typeof value.type === "string"
  );
}

function isStoredMessage(value: unknown): value is ChatMessage {
  if (
    !isRecord(value) ||
    (value.role !== "user" && value.role !== "assistant") ||
    typeof value.content !== "string"
  ) {
    return false;
  }

  if (value.role === "user") {
    return value.projects === undefined;
  }

  return (
    Array.isArray(value.projects) &&
    value.projects.every(isStoredProject)
  );
}

function parseStoredChatState(serialized: string): StoredChatState | null {
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      !Array.isArray(parsed.messages) ||
      typeof parsed.isOpen !== "boolean"
    ) {
      return null;
    }

    const storedMessages: unknown[] = parsed.messages;
    return {
      messages: storedMessages
        .filter(isStoredMessage)
        .slice(-maxStoredMessages),
      isOpen: parsed.isOpen,
    };
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }

    if (!error.response) {
      return "Không kết nối được đến trợ lý. Hãy kiểm tra mạng rồi thử lại.";
    }
  }

  return "Trợ lý chưa thể trả lời lúc này. Bạn hãy thử lại sau.";
}

function ChatBubbleIcon() {
  return (
    <SvgIcon>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    </SvgIcon>
  );
}

function CloseIcon() {
  return (
    <SvgIcon>
      <path d="m19 6.41-1.41-1.41L12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

function SendIcon() {
  return (
    <SvgIcon>
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </SvgIcon>
  );
}

export default function ChatWidget() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [completedMessages, setCompletedMessages] = useState<ChatMessage[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryPayload, setRetryPayload] = useState<ChatRequestPayload | null>(
    null,
  );
  const messagesRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const activeRequestRef = useRef<AbortController | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  const chatMutation = useMutation({
    mutationFn: ({ message, history, signal }: ChatMutationInput) =>
      sendChat(message, history, signal),
  });
  const { mutateAsync } = chatMutation;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
  }, []);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    if (previousUserId && previousUserId !== userId) {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      if (!userId) {
        sessionStorage.removeItem(`chat-widget:${previousUserId}`);
      }
      setMessages([]);
      setCompletedMessages([]);
      setIsOpen(false);
      setErrorMessage(null);
      setRetryPayload(null);
    }

    previousUserIdRef.current = userId;
    setLoadedUserId(null);
    if (!userId) {
      return;
    }

    const storedValue = sessionStorage.getItem(`chat-widget:${userId}`);
    const storedState = storedValue
      ? parseStoredChatState(storedValue)
      : null;
    const restoredState = storedState ?? { messages: [], isOpen: false };

    setMessages(restoredState.messages);
    setCompletedMessages(restoredState.messages);
    setIsOpen(restoredState.isOpen);
    setErrorMessage(null);
    setRetryPayload(null);
    setLoadedUserId(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || loadedUserId !== userId) {
      return;
    }

    sessionStorage.setItem(
      `chat-widget:${userId}`,
      JSON.stringify({
        messages: completedMessages.slice(-maxStoredMessages),
        isOpen,
      }),
    );
  }, [completedMessages, isOpen, loadedUserId, userId]);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages, chatMutation.isPending, errorMessage, isOpen]);

  const requestReply = useCallback(
    async (payload: ChatRequestPayload) => {
      const controller = new AbortController();
      activeRequestRef.current = controller;
      setErrorMessage(null);

      try {
        const response = await mutateAsync({
          ...payload,
          signal: controller.signal,
        });
        if (
          !mountedRef.current ||
          activeRequestRef.current !== controller
        ) {
          return;
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.reply,
          projects: response.projects,
        };
        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]);
        setCompletedMessages((currentMessages) => {
          const nextMessages: ChatMessage[] = [
            ...currentMessages,
            { role: "user", content: payload.message },
            assistantMessage,
          ];
          return nextMessages.slice(-maxStoredMessages);
        });
        setRetryPayload(null);
      } catch (error: unknown) {
        if (
          !mountedRef.current ||
          activeRequestRef.current !== controller ||
          controller.signal.aborted
        ) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setRetryPayload(payload);
      } finally {
        if (
          mountedRef.current &&
          activeRequestRef.current === controller
        ) {
          activeRequestRef.current = null;
        }
      }
    },
    [mutateAsync],
  );

  const sendMessage = useCallback(
    (value: string) => {
      const message = value.trim();
      if (!message || activeRequestRef.current) {
        return;
      }

      const payload: ChatRequestPayload = {
        message,
        history: messages.slice(-6).map(({ role, content }) => ({
          role,
          content,
        })),
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "user", content: message },
      ]);
      setInput("");
      void requestReply(payload);
    },
    [messages, requestReply],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  if (!user || loadedUserId !== userId) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="Mở khung chatbot"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            zIndex: theme.zIndex.modal,
          }}
        >
          <ChatBubbleIcon />
        </Fab>
      )}

      <Paper
        role="dialog"
        aria-label="Trợ lý gợi ý dự án"
        aria-hidden={!isOpen}
        sx={{
          position: "fixed",
          right: { xs: 12, sm: 24 },
          bottom: { xs: 12, sm: 24 },
          zIndex: theme.zIndex.modal,
          display: "flex",
          flexDirection: "column",
          width: { xs: "calc(100vw - 24px)", sm: 380 },
          height: { xs: "min(72vh, 620px)", sm: 560 },
          maxHeight: "calc(100vh - 24px)",
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 8,
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "translateY(0) scale(1)"
            : "translateY(8px) scale(0.98)",
          visibility: isOpen ? "visible" : "hidden",
          transition: isOpen
            ? theme.transitions.create(["transform", "opacity"], {
                duration: 160,
              })
            : `${theme.transitions.create(["transform", "opacity"], {
                duration: 160,
              })}, visibility 0s linear 160ms`,
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Gợi ý dự án
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Trợ lý Portfolio Map
            </Typography>
          </Box>
          <IconButton
            aria-label="Đóng khung chatbot"
            onClick={() => setIsOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          ref={messagesRef}
          role="log"
          aria-live="polite"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 2,
          }}
        >
          {messages.length === 0 ? (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                Xin chào! Hãy cho tôi biết bạn đang tìm loại dự án nào.
              </Typography>
              <Stack spacing={1}>
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outlined"
                    size="small"
                    disabled={chatMutation.isPending}
                    onClick={() => sendMessage(question)}
                    sx={{ justifyContent: "flex-start", textAlign: "left" }}
                  >
                    {question}
                  </Button>
                ))}
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {messages.map((message, index) => {
                const isUserMessage = message.role === "user";
                return (
                  <Box
                    key={`${message.role}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: isUserMessage ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "90%",
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: isUserMessage
                          ? "primary.main"
                          : "background.default",
                        color: isUserMessage
                          ? "primary.contrastText"
                          : "text.primary",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mb: 0.25, opacity: 0.8 }}
                      >
                        {isUserMessage ? "Bạn" : "Trợ lý"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {message.content.replace(/\*\*/g, "")}
                      </Typography>
                      {!isUserMessage && message.projects?.length ? (
                        <Stack
                          direction="row"
                          useFlexGap
                          spacing={0.75}
                          sx={{ mt: 1, flexWrap: "wrap" }}
                        >
                          {message.projects.map((project) => (
                            <Chip
                              key={project.id}
                              component={RouterLink}
                              to={`/projects/${project.id}`}
                              clickable
                              size="small"
                              color="primary"
                              variant="outlined"
                              label={`${project.title} · ${project.type}`}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          {chatMutation.isPending && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, alignItems: "center" }}
            >
              <CircularProgress size={16} aria-label="Đang trả lời" />
              <Typography variant="body2" color="text.secondary">
                Đang trả lời...
              </Typography>
            </Stack>
          )}
        </Box>

        {errorMessage && retryPayload && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                disabled={chatMutation.isPending}
                onClick={() => void requestReply(retryPayload)}
              >
                Thử lại
              </Button>
            }
            sx={{ mx: 1.5, mb: 1 }}
          >
            {errorMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            p: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            size="small"
            label="Tin nhắn"
            value={input}
            disabled={chatMutation.isPending}
            onChange={(event) => setInput(event.target.value.slice(0, 500))}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            slotProps={{
              htmlInput: { maxLength: 500 },
              formHelperText: { sx: { textAlign: "right", mr: 0 } },
            }}
            helperText={`${input.length}/500`}
          />
          <IconButton
            type="submit"
            color="primary"
            aria-label="Gửi tin nhắn"
            disabled={chatMutation.isPending || !input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </>
  );
}

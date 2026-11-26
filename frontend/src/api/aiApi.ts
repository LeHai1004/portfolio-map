import { api } from "./client";

export type AiChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatRequest = {
  message: string;
  history: AiChatHistoryItem[];
};

export type AiChatResponse = {
  reply: string;
  projects: { id: number; title: string; type: string }[];
};

export async function sendChat(
  message: string,
  history: AiChatHistoryItem[],
  signal?: AbortSignal,
): Promise<AiChatResponse> {
  const response = await api.post<AiChatResponse>(
    "/api/ai/chat",
    { message, history } satisfies AiChatRequest,
    { signal },
  );
  return response.data;
}

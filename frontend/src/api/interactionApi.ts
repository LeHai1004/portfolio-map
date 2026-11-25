import { api } from "./client";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export type LikeStatusDto = {
  count: number;
  likedByMe: boolean;
};

export type CommentDto = {
  id: number;
  projectId: number;
  content: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
};

export type CreateCommentRequest = {
  content: string;
};

function withAbsoluteAuthorAvatar(comment: CommentDto): CommentDto {
  return {
    ...comment,
    author: {
      ...comment.author,
      avatarUrl: toAbsoluteUrl(comment.author.avatarUrl),
    },
  };
}

export async function getLikeStatus(
  projectId: number,
): Promise<LikeStatusDto> {
  const response = await api.get<LikeStatusDto>(
    `/api/projects/${projectId}/like`,
  );
  return response.data;
}

export async function addLike(projectId: number): Promise<LikeStatusDto> {
  const response = await api.post<LikeStatusDto>(
    `/api/projects/${projectId}/like`,
  );
  return response.data;
}

export async function removeLike(projectId: number): Promise<void> {
  await api.delete(`/api/projects/${projectId}/like`);
}

export async function getComments(
  projectId: number,
  page: number,
  pageSize: number,
): Promise<PagedResult<CommentDto>> {
  const response = await api.get<PagedResult<CommentDto>>(
    `/api/projects/${projectId}/comments`,
    { params: { page, pageSize } },
  );
  return {
    ...response.data,
    items: response.data.items.map(withAbsoluteAuthorAvatar),
  };
}

export async function createComment(
  projectId: number,
  request: CreateCommentRequest,
): Promise<CommentDto> {
  const response = await api.post<CommentDto>(
    `/api/projects/${projectId}/comments`,
    request,
  );
  return withAbsoluteAuthorAvatar(response.data);
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/api/comments/${commentId}`);
}

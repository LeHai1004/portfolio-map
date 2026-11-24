import { isAxiosError } from "axios";
import { api } from "./client";

export type InboxMessageDto = {
  id: number;
  fromCompany: {
    id: string;
    companyName: string;
    logoUrl: string | null;
  };
  subject: string;
  projectTitle: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type ContactDto = {
  id: number;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  projectId: number | null;
  projectTitle: string | null;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
};

let inboxCache: InboxMessageDto[] = [];

function toInboxMessage(item: ContactDto): InboxMessageDto {
  return {
    id: item.id,
    fromCompany: {
      id: item.fromUserId,
      companyName: item.fromName,
      logoUrl: null,
    },
    subject: item.subject,
    projectTitle: item.projectTitle,
    content: item.content,
    isRead: item.isRead,
    createdAt: item.createdAt,
  };
}

export async function getInbox(): Promise<InboxMessageDto[]> {
  const response = await api.get<PagedResult<ContactDto>>(
    "/api/contacts/inbox",
  );
  inboxCache = response.data.items.map(toInboxMessage);
  return inboxCache;
}

export async function getSentContacts(
  page = 1,
  pageSize = 10,
): Promise<PagedResult<ContactDto>> {
  const response = await api.get<PagedResult<ContactDto>>(
    "/api/contacts/sent",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function markInboxMessageAsRead(
  id: number,
): Promise<InboxMessageDto | null> {
  try {
    await api.put(`/api/contacts/${id}/read`);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }

  const cached = inboxCache.find((item) => item.id === id);
  if (cached) {
    const updated = { ...cached, isRead: true };
    inboxCache = inboxCache.map((item) =>
      item.id === id ? updated : item,
    );
    return updated;
  }

  let page = 1;
  let pageSize = 10;
  let totalItems = Number.POSITIVE_INFINITY;

  while ((page - 1) * pageSize < totalItems) {
    const response = await api.get<PagedResult<ContactDto>>(
      "/api/contacts/inbox",
      { params: { page, pageSize } },
    );
    const result = response.data;
    const message = result.items.find((item) => item.id === id);

    if (message) {
      const updated = { ...toInboxMessage(message), isRead: true };
      inboxCache = [...inboxCache, updated];
      return updated;
    }

    if (
      result.page !== page ||
      result.pageSize < 1 ||
      result.totalItems < 0
    ) {
      throw new Error("API trả về thông tin phân trang inbox không hợp lệ.");
    }

    page = result.page + 1;
    pageSize = result.pageSize;
    totalItems = result.totalItems;
  }

  throw new Error(
    `Đã đánh dấu thư ${id} đã đọc nhưng không tìm thấy trong inbox.`,
  );
}

export type CreateContactRequest = {
  projectId: number;
  subject: string;
  content: string;
};

export type CreateContactResponse = {
  id: number;
  projectId: number;
  subject: string;
  content: string;
  createdAt: string;
};

export type ContactFieldErrors = Partial<
  Record<"subject" | "content", string[]>
>;

export class ContactValidationError extends Error {
  readonly errors: ContactFieldErrors;

  constructor(errors: ContactFieldErrors) {
    super("Dữ liệu không hợp lệ");
    this.name = "ContactValidationError";
    this.errors = errors;
  }
}

export async function sendContactMessage(
  data: CreateContactRequest,
): Promise<CreateContactResponse> {
  const errors: ContactFieldErrors = {};
  if (!data.subject.trim()) {
    errors.subject = ["Vui lòng nhập tiêu đề."];
  } else if (data.subject.length > 200) {
    errors.subject = ["Tiêu đề không được vượt quá 200 ký tự."];
  }
  if (!data.content.trim()) {
    errors.content = ["Vui lòng nhập nội dung."];
  } else if (data.content.length > 2000) {
    errors.content = ["Nội dung không được vượt quá 2000 ký tự."];
  }
  if (Object.keys(errors).length > 0) {
    throw new ContactValidationError(errors);
  }

  const response = await api.post<{ id: number; createdAt: string }>(
    "/api/contacts",
    data,
  );
  return {
    id: response.data.id,
    projectId: data.projectId,
    subject: data.subject.trim(),
    content: data.content.trim(),
    createdAt: response.data.createdAt,
  };
}

export function getContactFieldErrors(
  error: unknown,
): ContactFieldErrors | null {
  if (error instanceof ContactValidationError) {
    return error.errors;
  }
  if (!isAxiosError<{ errors?: ContactFieldErrors }>(error)) {
    return null;
  }
  return error.response?.data?.errors ?? null;
}

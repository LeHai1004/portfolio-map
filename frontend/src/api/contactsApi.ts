import { isAxiosError } from "axios";

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

const mockInboxMessages: InboxMessageDto[] = [
  {
    id: 1,
    fromCompany: {
      id: "1",
      companyName: "Công ty Công nghệ Đà Nẵng",
      logoUrl: null,
    },
    subject: "Cơ hội thực tập Frontend",
    projectTitle: "Website portfolio sinh viên",
    content:
      "Chào bạn, đội ngũ của chúng tôi đã xem qua dự án portfolio và rất ấn tượng với cách bạn tổ chức giao diện. Bạn có thể chia sẻ thêm về kinh nghiệm React và thời gian có thể bắt đầu thực tập không?",
    isRead: false,
    createdAt: "2026-10-27T08:30:00Z",
  },
  {
    id: 2,
    fromCompany: {
      id: "2",
      companyName: "Blue Ocean Labs",
      logoUrl: null,
    },
    subject: "Trao đổi về dự án quản lý chi tiêu",
    projectTitle: "App quản lý chi tiêu",
    content:
      "Xin chào, chúng tôi muốn tìm hiểu thêm về phần đồng bộ dữ liệu và các công nghệ bạn đã sử dụng trong ứng dụng.",
    isRead: true,
    createdAt: "2026-10-25T10:15:00Z",
  },
];

export async function getInbox(): Promise<InboxMessageDto[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockInboxMessages;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<InboxMessageDto[]>("/api/contacts/inbox");
  // return response.data;
}

export async function markInboxMessageAsRead(
  id: number,
): Promise<InboxMessageDto | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const message = mockInboxMessages.find((item) => item.id === id);
  if (!message) {
    return null;
  }

  message.isRead = true;
  return message;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.put<InboxMessageDto>(`/api/contacts/${id}/read`);
  // return response.data;
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

let nextMockContactId = 3;

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

  await new Promise((resolve) => setTimeout(resolve, 350));
  return {
    id: nextMockContactId++,
    projectId: data.projectId,
    subject: data.subject,
    content: data.content,
    createdAt: new Date().toISOString(),
  };

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.post<CreateContactResponse>("/api/contacts", data);
  // return response.data;
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

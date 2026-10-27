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

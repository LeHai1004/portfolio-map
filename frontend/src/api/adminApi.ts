import type { ProjectType } from "./projectsApi";

export type AdminProjectDto = {
  id: number;
  title: string;
  type: ProjectType;
  status: "Active" | "Hidden";
  ownerId: string;
  ownerName: string;
  createdAt: string;
};

export type AdminUserDto = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isLocked: boolean;
  createdAt: string;
};

export type AdminPagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
};

type AdminPageRequest = {
  page: number;
  pageSize: number;
};

const mockProjects: AdminProjectDto[] = [
  {
    id: 1,
    title: "App quản lý chi tiêu",
    type: "Mobile",
    status: "Active",
    ownerId: "u1",
    ownerName: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Website portfolio",
    type: "Web",
    status: "Active",
    ownerId: "u1",
    ownerName: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Game platformer 2D",
    type: "Game",
    status: "Active",
    ownerId: "u2",
    ownerName: "Trần Thị B",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "Nhận diện biển số xe",
    type: "AI",
    status: "Hidden",
    ownerId: "u3",
    ownerName: "Lê Văn C",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "Hệ thống quản lý thư viện",
    type: "Web",
    status: "Active",
    ownerId: "u2",
    ownerName: "Trần Thị B",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    title: "Dự án đã ẩn (admin mock)",
    type: "Web",
    status: "Hidden",
    ownerId: "u3",
    ownerName: "Lê Văn C",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    title: "Chatbot hỗ trợ sinh viên",
    type: "AI",
    status: "Active",
    ownerId: "u4",
    ownerName: "Phạm Thị D",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    title: "App học từ vựng tiếng Anh",
    type: "Mobile",
    status: "Active",
    ownerId: "u4",
    ownerName: "Phạm Thị D",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockUsers: AdminUserDto[] = [
  {
    id: "u1",
    email: "vana@student.vn",
    fullName: "Nguyễn Văn A",
    role: "Student",
    isLocked: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u2",
    email: "thib@student.vn",
    fullName: "Trần Thị B",
    role: "Student",
    isLocked: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u3",
    email: "vanc@student.vn",
    fullName: "Lê Văn C",
    role: "Student",
    isLocked: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u4",
    email: "thid@student.vn",
    fullName: "Phạm Thị D",
    role: "Student",
    isLocked: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u5",
    email: "vane@company.vn",
    fullName: "Công ty E",
    role: "Company",
    isLocked: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "admin1",
    email: "admin@portfoliomap.vn",
    fullName: "Quản trị viên",
    role: "Admin",
    isLocked: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getPagedResult<T>(
  items: T[],
  { page, pageSize }: AdminPageRequest,
): AdminPagedResult<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: items.length,
  };
}

export async function getAdminProjects({
  page,
  pageSize,
}: AdminPageRequest): Promise<AdminPagedResult<AdminProjectDto>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const sortedProjects = [...mockProjects].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
  return getPagedResult(sortedProjects, { page, pageSize });

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<AdminPagedResult<AdminProjectDto>>("/api/admin/projects", { params: { page, pageSize } });
  // return response.data;
}

export async function setProjectStatus(
  id: number,
  status: AdminProjectDto["status"],
): Promise<AdminProjectDto> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const project = mockProjects.find((item) => item.id === id);
  if (!project) {
    throw new Error("Không tìm thấy dự án.");
  }
  project.status = status;
  return { ...project };

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.put<AdminProjectDto>(`/api/admin/projects/${id}/status`, { status });
  // return response.data;
}

export async function getAdminUsers({
  page,
  pageSize,
}: AdminPageRequest): Promise<AdminPagedResult<AdminUserDto>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const sortedUsers = [...mockUsers].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime(),
  );
  return getPagedResult(sortedUsers, { page, pageSize });

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<AdminPagedResult<AdminUserDto>>("/api/admin/users", { params: { page, pageSize } });
  // return response.data;
}

export async function setUserLocked(
  id: string,
  isLocked: boolean,
): Promise<AdminUserDto> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = mockUsers.find((item) => item.id === id);
  if (!user) {
    throw new Error("Không tìm thấy người dùng.");
  }
  if (isLocked && user.role === "Admin") {
    throw new Error("Không thể khóa tài khoản Admin khác.");
  }
  user.isLocked = isLocked;
  return { ...user };

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.put<AdminUserDto>(`/api/admin/users/${id}/lock`, { isLocked });
  // return response.data;
}

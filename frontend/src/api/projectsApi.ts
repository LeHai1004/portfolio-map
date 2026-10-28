// Hàm gọi API cho dự án. Hiện trả dữ liệu giả đúng dạng hợp đồng POST /api/projects.
// Khi backend xong chỉ cần sửa bên trong hàm createProject.

export type ProjectType = "Web" | "Mobile" | "Game" | "AI" | "Other";

export type CreateProjectRequest = {
  title: string;
  description?: string;
  type: ProjectType;
  latitude: number;
  longitude: number;
  addressText?: string;
  universityId?: number;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
};

export type UpdateProjectRequest = Pick<
  CreateProjectRequest,
  "title" | "description" | "type" | "latitude" | "longitude" | "githubUrl"
>;

export type CreateProjectResponse = {
  id: number;
  title: string;
};

export type ProjectDetailDto = {
  id: number;
  title: string;
  description: string | null;
  type: ProjectType;
  latitude: number;
  longitude: number;
  addressText: string | null;
  universityId: number | null;
  universityName: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  images: { id: number; imageUrl: string }[];
  tags: { id: number; name: string }[];
  owner: { id: string; fullName: string; avatarUrl: string | null };
  viewCount: number;
  createdAt: string;
};

const mockProjectDetails: Record<number, ProjectDetailDto> = {
  1: {
    id: 1,
    title: "App quản lý chi tiêu",
    description:
      "Ứng dụng ghi chép thu chi cá nhân, theo dõi ngân sách và xem biểu đồ tổng hợp theo tháng.",
    type: "Mobile",
    latitude: 16.0738,
    longitude: 108.1499,
    addressText: "Đại học Bách Khoa - ĐH Đà Nẵng",
    universityId: 1,
    universityName: "Đại học Bách Khoa - ĐH Đà Nẵng",
    githubUrl: "https://github.com/example/expense-app",
    demoUrl: "https://example.com/expense-app",
    thumbnailUrl: "/uploads/mock/1-1.jpg",
    images: [
      { id: 11, imageUrl: "/uploads/mock/1-1.jpg" },
      { id: 12, imageUrl: "/uploads/mock/1-2.jpg" },
    ],
    tags: [
      { id: 2, name: "C#" },
      { id: 7, name: "Flutter" },
    ],
    owner: {
      id: "1",
      fullName: "Nguyễn Văn A",
      avatarUrl: "/uploads/avatars/1.jpg",
    },
    viewCount: 120,
    createdAt: "2026-10-03T12:00:00Z",
  },
};

export async function getProjectById(
  id: number,
): Promise<ProjectDetailDto | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockProjectDetails[id] ?? null;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<ProjectDetailDto>(`/api/projects/${id}`);
  // return response.data;
}

export async function getMyProjects(): Promise<ProjectDetailDto[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return Object.values(mockProjectDetails);

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<ProjectDetailDto[]>("/api/projects/mine");
  // return response.data;
}

export async function updateProject(
  id: number,
  data: UpdateProjectRequest,
): Promise<ProjectDetailDto> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const project = mockProjectDetails[id];
  if (!project) {
    throw new Error("Không tìm thấy dự án cần cập nhật.");
  }

  const updatedProject: ProjectDetailDto = {
    ...project,
    ...data,
    description: data.description ?? null,
    githubUrl: data.githubUrl ?? null,
  };
  mockProjectDetails[id] = updatedProject;
  return updatedProject;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.put<ProjectDetailDto>(`/api/projects/${id}`, data);
  // return response.data;
}

export async function deleteProject(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (!mockProjectDetails[id]) {
    throw new Error("Không tìm thấy dự án cần xóa.");
  }
  delete mockProjectDetails[id];

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // await api.delete(`/api/projects/${id}`);
}

export async function createProject(
  data: CreateProjectRequest,
): Promise<CreateProjectResponse> {
  // Dữ liệu giả: giả lập chờ 500ms như gọi mạng thật
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { id: Math.floor(Math.random() * 1000) + 1, title: data.title };

  // Sau này đổi thành:
  // const res = await api.post("/api/projects", data);
  // return res.data;
}

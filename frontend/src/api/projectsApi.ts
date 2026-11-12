// Hàm gọi API cho dự án. Hiện trả dữ liệu giả đúng dạng hợp đồng POST /api/projects.
// Khi backend xong chỉ cần sửa bên trong hàm createProject.

import { getTags } from "./tagsApi";

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
  tagIds: number[];
};

export type UpdateProjectRequest = CreateProjectRequest;

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

export type ProjectSummaryDto = {
  id: number;
  title: string;
  type: ProjectType;
  thumbnailUrl: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
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

async function getMockTags(tagIds: number[]) {
  const availableTags = await getTags();
  return tagIds.map((id) => {
    const tag = availableTags.find((item) => item.id === id);
    if (!tag) {
      throw new Error(`Không tìm thấy thẻ kỹ năng ${id}.`);
    }
    return { id: tag.id, name: tag.name };
  });
}

export async function getProjectById(
  id: number,
): Promise<ProjectDetailDto | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockProjectDetails[id] ?? null;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // try {
  //   const response = await api.get<ProjectDetailDto>(`/api/projects/${id}`);
  //   return response.data;
  // } catch (error) {
  //   if (isAxiosError(error) && error.response?.status === 404) return null;
  //   throw error;
  // }
}

export async function getMyProjects(): Promise<
  PagedResult<ProjectSummaryDto>
> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const items = Object.values(mockProjectDetails).map(
    ({ id, title, type, thumbnailUrl, latitude, longitude, createdAt }) => ({
      id,
      title,
      type,
      thumbnailUrl,
      latitude,
      longitude,
      createdAt,
    }),
  );
  return { items, page: 1, pageSize: 50, totalItems: items.length };

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<PagedResult<ProjectSummaryDto>>("/api/projects/mine", { params: { page: 1, pageSize: 50 } });
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
  const tags = await getMockTags(data.tagIds);

  const updatedProject: ProjectDetailDto = {
    ...project,
    title: data.title,
    description: data.description ?? null,
    type: data.type,
    latitude: data.latitude,
    longitude: data.longitude,
    addressText: data.addressText ?? null,
    universityId: data.universityId ?? null,
    githubUrl: data.githubUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    tags,
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

  // Khi backend sẵn sàng, API trả 204, không có body:
  // await api.delete(`/api/projects/${id}`);
}

export async function createProject(
  data: CreateProjectRequest,
): Promise<ProjectDetailDto> {
  // Dữ liệu giả: giả lập chờ 500ms như gọi mạng thật
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tags = await getMockTags(data.tagIds);
  const id =
    Math.max(0, ...Object.keys(mockProjectDetails).map(Number)) + 1;
  const project: ProjectDetailDto = {
    id,
    title: data.title,
    description: data.description ?? null,
    type: data.type,
    latitude: data.latitude,
    longitude: data.longitude,
    addressText: data.addressText ?? null,
    universityId: data.universityId ?? null,
    universityName: null,
    githubUrl: data.githubUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    thumbnailUrl: null,
    images: [],
    tags,
    owner: {
      id: "1",
      fullName: "Nguyễn Văn A",
      avatarUrl: null,
    },
    viewCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockProjectDetails[id] = project;
  return project;

  // Khi backend sẵn sàng, API trả 201 kèm chi tiết:
  // const response = await api.post<ProjectDetailDto>("/api/projects", data);
  // return response.data;
}

export async function uploadProjectImage(
  projectId: number,
  file: File,
): Promise<{ id: number; imageUrl: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const project = mockProjectDetails[projectId];
  if (!project) {
    throw new Error("Không tìm thấy dự án cần thêm ảnh.");
  }

  const id = Math.max(0, ...project.images.map((image) => image.id)) + 1;
  const image = {
    id,
    imageUrl: `/uploads/mock/${projectId}-${id}-${encodeURIComponent(file.name)}`,
  };
  project.images.push(image);
  return image;

  // Khi backend sẵn sàng, API trả 201:
  // const formData = new FormData();
  // formData.append("file", file);
  // const response = await api.post<{ id: number; imageUrl: string }>(
  //   `/api/projects/${projectId}/images`,
  //   formData,
  //   { headers: { "Content-Type": "multipart/form-data" } },
  // );
  // return response.data;
}

export async function deleteProjectImage(
  projectId: number,
  imageId: number,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const project = mockProjectDetails[projectId];
  if (!project) {
    throw new Error("Không tìm thấy dự án cần xóa ảnh.");
  }
  const imageIndex = project.images.findIndex((image) => image.id === imageId);
  if (imageIndex === -1) {
    throw new Error("Không tìm thấy ảnh cần xóa.");
  }
  project.images.splice(imageIndex, 1);

  // Khi backend sẵn sàng, API trả 204, không có body:
  // await api.delete(`/api/projects/${projectId}/images/${imageId}`);
}

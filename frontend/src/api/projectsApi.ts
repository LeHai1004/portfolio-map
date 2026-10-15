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

export type CreateProjectResponse = {
  id: number;
  title: string;
};

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

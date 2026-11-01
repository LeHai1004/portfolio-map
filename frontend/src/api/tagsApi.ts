export type TagDto = {
  id: number;
  name: string;
};

const mockTags: TagDto[] = [
  { id: 1, name: "React" },
  { id: 2, name: "C#" },
  { id: 3, name: "ASP.NET Core" },
  { id: 4, name: "Unity" },
  { id: 5, name: "Python" },
  { id: 6, name: "TypeScript" },
  { id: 7, name: "Flutter" },
  { id: 8, name: "SQL Server" },
  { id: 9, name: "TensorFlow" },
  { id: 10, name: "Node.js" },
];

export async function getTags(): Promise<TagDto[]> {
  return mockTags;

  // Khi API sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<TagDto[]>("/api/tags");
  // return response.data;
}

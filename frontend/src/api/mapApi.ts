export type MapPin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type: string;
  thumbnailUrl: string;
};

const mockPins: MapPin[] = [
  {
    id: 1,
    title: "App quản lý chi tiêu",
    lat: 16.0738,
    lng: 108.1499,
    type: "Mobile",
    thumbnailUrl: "",
  },
  {
    id: 2,
    title: "Website bán hàng",
    lat: 16.0471,
    lng: 108.2193,
    type: "Web",
    thumbnailUrl: "",
  },
  {
    id: 3,
    title: "Game rắn săn mồi",
    lat: 16.0617,
    lng: 108.1566,
    type: "Game",
    thumbnailUrl: "",
  },
  {
    id: 4,
    title: "Chatbot hỏi đáp",
    lat: 16.0544,
    lng: 108.2022,
    type: "AI",
    thumbnailUrl: "",
  },
];

// Hiện trả dữ liệu giả. Khi backend xong chỉ sửa bên trong hàm này
export async function getMapPins(): Promise<MapPin[]> {
  return mockPins;
}

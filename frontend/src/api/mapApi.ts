export type MapPin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type: string;
  thumbnailUrl: string;
};

export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
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

const types = ["Web", "Mobile", "Game", "AI"];
const manyPins: MapPin[] = Array.from({ length: 40 }, (_, i) => ({
  id: 100 + i,
  title: `Dự án mẫu ${i + 1}`,
  lat: 16.0544 + (Math.random() - 0.5) * 0.08,
  lng: 108.2022 + (Math.random() - 0.5) * 0.08,
  type: types[i % 4],
  thumbnailUrl: "",
}));

// Hiện lọc dữ liệu giả. Khi backend sẵn sàng chỉ cần gọi API trong hàm này.
export async function getMapPins(bounds: MapBounds): Promise<MapPin[]> {
  const allPins = [...mockPins, ...manyPins];
  return allPins.filter(
    (pin) =>
      pin.lat >= bounds.minLat &&
      pin.lat <= bounds.maxLat &&
      pin.lng >= bounds.minLng &&
      pin.lng <= bounds.maxLng,
  );

  // Khi API sẵn sàng, thay bằng:
  // const response = await api.get<MapPin[]>("/api/map/pins", { params: bounds });
  // return response.data;
}

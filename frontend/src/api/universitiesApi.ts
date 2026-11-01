export type UniversityDto = {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

const mockUniversities: UniversityDto[] = [
  {
    id: 1,
    name: "Đại học Bách Khoa - ĐH Đà Nẵng",
    address: "54 Nguyễn Lương Bằng, Liên Chiểu",
    latitude: 16.0738,
    longitude: 108.1499,
  },
  {
    id: 2,
    name: "Đại học Sư phạm - ĐH Đà Nẵng",
    address: "459 Tôn Đức Thắng, Liên Chiểu",
    latitude: 16.0613,
    longitude: 108.1578,
  },
  {
    id: 3,
    name: "Đại học Kinh tế - ĐH Đà Nẵng",
    address: "71 Ngũ Hành Sơn, Ngũ Hành Sơn",
    latitude: 16.0472,
    longitude: 108.2406,
  },
  {
    id: 4,
    name: "Đại học Duy Tân",
    address: "254 Nguyễn Văn Linh, Thanh Khê",
    latitude: 16.0600,
    longitude: 108.2100,
  },
  {
    id: 5,
    name: "Đại học FPT Đà Nẵng",
    address: "Khu đô thị FPT, Ngũ Hành Sơn",
    latitude: 15.9689,
    longitude: 108.2605,
  },
];

export async function getUniversities(): Promise<UniversityDto[]> {
  return mockUniversities;

  // Khi API sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<UniversityDto[]>("/api/universities");
  // return response.data;
}

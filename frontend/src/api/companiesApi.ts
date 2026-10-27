export type CompanyProfileDto = {
  id: string;
  companyName: string;
  website: string | null;
  address: string | null;
  description: string | null;
  logoUrl: string | null;
};

const mockCompanies: Record<string, CompanyProfileDto> = {
  "1": {
    id: "1",
    companyName: "Công ty Công nghệ Đà Nẵng",
    website: "https://example.com",
    address: "Hải Châu, Đà Nẵng",
    description:
      "Chúng tôi xây dựng các sản phẩm phần mềm phục vụ doanh nghiệp và cộng đồng. Đội ngũ luôn tìm kiếm những ý tưởng mới và cơ hội đồng hành cùng các bạn sinh viên.",
    logoUrl: null,
  },
  "2": {
    id: "2",
    companyName: "Blue Ocean Labs",
    website: "https://blueocean.example.com",
    address: "Ngũ Hành Sơn, Đà Nẵng",
    description:
      "Blue Ocean Labs phát triển giải pháp web và dữ liệu, với môi trường học hỏi dành cho các kỹ sư trẻ.",
    logoUrl: null,
  },
};

export async function getCompanyById(
  id: string,
): Promise<CompanyProfileDto | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCompanies[id] ?? null;

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // const response = await api.get<CompanyProfileDto>(`/api/companies/${id}`);
  // return response.data;
}

const mockSavedProjectIds = new Set<number>();

export async function saveProject(projectId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  mockSavedProjectIds.add(projectId);

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // await api.post(`/api/saved-projects/${projectId}`);
}

export async function removeSavedProject(projectId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  mockSavedProjectIds.delete(projectId);

  // Khi backend sẵn sàng, thay dữ liệu giả bằng:
  // await api.delete(`/api/saved-projects/${projectId}`);
}

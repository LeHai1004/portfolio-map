export function toAbsoluteUrl(path: null): null;
export function toAbsoluteUrl(path: string): string;
export function toAbsoluteUrl(path: string | null): string | null;
export function toAbsoluteUrl(path: string | null): string | null {
  if (!path || path.startsWith("http") || !path.startsWith("/")) return path;

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";
  return `${baseUrl}${path}`;
}

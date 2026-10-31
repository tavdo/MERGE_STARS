import { getMuseumPoint, type MuseumPointId } from "./museum-tour";

// Presentation bookmarks only. Never an attribution/QR token, user ID,
// private draft, Brand House, CORE product or generated-model identifier.
export function readMuseumBookmark(hash: string): MuseumPointId | null {
  const match = /^#museum=([a-z]+)$/.exec(hash);
  if (!match || match[0] !== hash) return null;
  try { return getMuseumPoint(match[1]).id; } catch { return null; }
}

export function museumBookmarkUrl(origin: string, pathname: string, pointId: MuseumPointId): string {
  getMuseumPoint(pointId);
  const base = new URL(origin);
  if (!["https:", "http:"].includes(base.protocol) || base.origin !== origin || base.username || base.password ||
      !pathname.startsWith("/") || pathname.startsWith("//") || /[?#\\]/.test(pathname)) throw new Error("Invalid Museum share location");
  const result = new URL(pathname, base);
  if (result.origin !== base.origin) throw new Error("Invalid Museum share origin");
  result.hash = `museum=${pointId}`;
  return result.href;
}

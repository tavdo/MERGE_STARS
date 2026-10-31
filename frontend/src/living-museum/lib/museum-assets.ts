// Optimized presentation derivatives only; canonical source PNGs stay intact.
export function museumPresentationAsset(src: string) {
  if (src.includes("-canonical-clean.png") || src.startsWith('/living-museum/assets/founder-')) return src;
  return /^\/living-museum\/assets\/[a-z0-9-]+\.png$/.test(src) && !src.startsWith("/living-museum/assets/merge-") ? src.replace("/living-museum/assets/", "/living-museum/assets/optimized/").replace(/\.png$/, ".webp") : src;
}

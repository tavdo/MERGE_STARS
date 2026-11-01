// Only derivatives that are actually bundled may replace a canonical PNG.
// Unknown/new photographs use their original file; never guess a WebP URL.
export const museumPresentationDerivatives = [
  "approved-mega-museum",
  "coin-case",
  "coin-reference",
  "craft-ecosystem",
  "elita-house",
  "elita-silver",
  "entrance",
  "entrance-closed",
  "entrance-dual",
  "entrance-dual-closed",
  "eyewear",
  "eyewear-silver",
  "family-house",
  "founder-atelier-stages-19-24",
  "founder-aurum-argentum-portal",
  "founder-brand-manager-dashboard",
  "founder-composite-yarn-research",
  "founder-living-luxury-system-20261019",
  "founder-merge-watch-your-time",
  "geni-story",
  "material-library",
  "material-passport",
  "merge-twelve-brand-towns-20261019",
  "mosaic-gold",
  "museum-coin-world",
  "museum-world",
  "smart-key",
  "vip-category-hall",
  "vip-create-version",
  "vip-digital-twin",
  "vip-grand-museum",
  "vip-labyrinth",
  "vip-star-dome"
] as const;
const bundled = new Set<string>(museumPresentationDerivatives);
export function museumPresentationAsset(src: string) {
  const match = /^\/assets\/([a-z0-9-]+)\.png$/.exec(src);
  return match && bundled.has(match[1]) ? `/museum-v78/assets/optimized/${match[1]}.webp` : src;
}

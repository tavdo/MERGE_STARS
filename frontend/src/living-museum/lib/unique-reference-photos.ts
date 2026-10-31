// Deduplicate presentation only; source files and CORE records stay untouched.
export function uniqueReferencePhotos<T extends { image: string }>(photos: readonly T[]): T[] {
  const seen = new Set<string>();
  return photos.filter(photo => {
    if (seen.has(photo.image)) return false;
    seen.add(photo.image);
    return true;
  });
}

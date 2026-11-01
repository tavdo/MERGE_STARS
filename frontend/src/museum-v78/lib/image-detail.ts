export type ImageCrop = readonly [number, number, number, number];
export const fullImage: ImageCrop = [0, 0, 1, 1];
export function imageDetailLayout(width: number, height: number, viewportWidth: number, viewportHeight: number, crop: ImageCrop = fullImage) {
  const [left, top, right, bottom] = crop;
  if (![width, height, viewportWidth, viewportHeight, ...crop].every(Number.isFinite) || Math.min(width, height, viewportWidth, viewportHeight) <= 0 || left < 0 || top < 0 || right > 1 || bottom > 1 || right <= left || bottom <= top) throw Error("INVALID_IMAGE_DETAIL");
  const naturalWidth = width * (right - left), naturalHeight = height * (bottom - top);
  const fit = Math.min((viewportWidth - Math.min(40, viewportWidth / 8)) / naturalWidth, (viewportHeight - Math.min(40, viewportHeight / 8)) / naturalHeight);
  return { naturalWidth, naturalHeight, width: naturalWidth * fit, height: naturalHeight * fit, nativeZoom: 1 / fit };
}
export function imageDetailTransform(layout: ReturnType<typeof imageDetailLayout>, zoom: number, x: number, y: number, viewportWidth: number, viewportHeight: number) {
  if (![zoom, x, y, viewportWidth, viewportHeight].every(Number.isFinite)) throw Error("INVALID_IMAGE_DETAIL");
  const boundedZoom = Math.max(Math.min(1, layout.nativeZoom), Math.min(Math.max(8, layout.nativeZoom), zoom));
  const width = layout.width * boundedZoom, height = layout.height * boundedZoom;
  const maxX = Math.max(0, (width - viewportWidth) / 2), maxY = Math.max(0, (height - viewportHeight) / 2);
  return { zoom: boundedZoom, width, height, x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
}

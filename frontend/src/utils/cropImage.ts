import type { Area } from 'react-easy-crop'

const OUTPUT_SIZE = 512

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Failed to load image')))
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

/** Crop a region and resize to a square JPEG suitable for avatar upload. */
export async function getCroppedAvatarFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'avatar.jpg',
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not export image'))),
      'image/jpeg',
      0.92,
    )
  })

  const base = fileName.replace(/\.[^.]+$/, '') || 'avatar'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
}

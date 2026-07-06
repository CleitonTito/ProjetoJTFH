/**
 * Redimensiona uma imagem no navegador antes do envio, evitando subir
 * arquivos gigantes para o Storage (o prompt pede compressão automática).
 */
export async function resizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file)

  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height))
  const width = Math.round(imageBitmap.width * scale)
  const height = Math.round(imageBitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return file
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', quality)
  })
}

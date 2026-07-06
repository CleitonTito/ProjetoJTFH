import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resizeImage } from '@/utils/resizeImage'
import { uploadImage } from '@/services/imageUpload'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.')
      return
    }

    setError(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const resized = await resizeImage(file)
      const url = await uploadImage(resized)
      onChange(url)
    } catch (err) {
      console.error('Failed to upload image', err)
      setError('Não foi possível enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
      setPreview(null)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0])
  }

  const displayUrl = preview ?? value

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {displayUrl ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-md border">
          <img
            src={displayUrl}
            alt="Pré-visualização"
            className="aspect-video w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Trocar
              </Button>
              <Button type="button" size="icon" variant="secondary" onClick={() => onChange('')}>
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <ImagePlus className="size-8" />
          <span>Arraste uma imagem ou clique para selecionar</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

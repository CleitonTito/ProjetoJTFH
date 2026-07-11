import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'
import { uploadImage } from '@/services/imageUpload'
import { resizeImage } from '@/utils/resizeImage'
import type { Category, PublicationStatus } from '@/types'

const MAX_GALLERY_IMAGES = 6

const publicationFormSchema = z.object({
  title: z.string().min(1, 'Informe o título'),
  subtitle: z.string().optional(),
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  summary: z.string().min(1, 'Informe o resumo').max(250, 'Máximo de 250 caracteres'),
  coverImageUrl: z.string().min(1, 'Envie uma imagem principal'),
  content: z.string().min(1, 'Escreva o conteúdo'),
  author: z.string().min(1, 'Informe o autor'),
  date: z.string().min(1, 'Informe a data'),
  highlighted: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.string().optional(),
})

export type PublicationFormValues = z.infer<typeof publicationFormSchema>

const STATUS_OPTIONS: { value: PublicationStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

interface PublicationFormProps {
  categories: Category[]
  defaultValues: PublicationFormValues
  defaultGalleryImages?: string[]
  onSubmit: (values: PublicationFormValues, galleryImages: string[]) => Promise<void>
  onCancel: () => void
}

export function PublicationForm({
  categories,
  defaultValues,
  defaultGalleryImages,
  onSubmit,
  onCancel,
}: PublicationFormProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultGalleryImages ?? [])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationFormSchema),
    defaultValues,
  })

  const summary = watch('summary') ?? ''
  const coverImageUrl = watch('coverImageUrl')
  const content = watch('content')
  const categoryId = watch('categoryId')
  const status = watch('status')
  const highlighted = watch('highlighted')

  async function handleGalleryFilesSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return
    }

    const files = Array.from(fileList)
    const remainingSlots = MAX_GALLERY_IMAGES - galleryImages.length
    const filesToUpload = files.slice(0, remainingSlots)

    setGalleryError(
      files.length > remainingSlots
        ? `Só foi possível adicionar ${remainingSlots} foto(s) — limite de ${MAX_GALLERY_IMAGES} por publicação.`
        : null,
    )

    if (filesToUpload.length === 0) {
      return
    }

    setUploadingGallery(true)

    try {
      const uploadedUrls = await Promise.all(
        filesToUpload.map(async (file) => uploadImage(await resizeImage(file))),
      )
      setGalleryImages((prev) => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Failed to upload gallery images', error)
      setGalleryError('Não foi possível enviar uma ou mais fotos. Tente novamente.')
    } finally {
      setUploadingGallery(false)
    }
  }

  function removeGalleryImage(url: string) {
    setGalleryImages((prev) => prev.filter((image) => image !== url))
  }

  async function submit(values: PublicationFormValues) {
    await onSubmit(values, galleryImages)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
        <Input id="subtitle" {...register('subtitle')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Categoria</Label>
          <Select
            value={categoryId}
            onValueChange={(value) =>
              setValue('categoryId', value ?? '', { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue>
                {(selectedId: string | null) => {
                  const found = categories.find((category) => category.id === selectedId)
                  return found ? found.name : 'Escolha uma categoria'
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="author">Autor</Label>
          <Input id="author" {...register('author')} />
          {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">Resumo</Label>
        <Textarea id="summary" maxLength={250} {...register('summary')} />
        <p className="text-right text-xs text-muted-foreground">{summary.length}/250</p>
        {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Imagem principal</Label>
        <ImageUpload
          value={coverImageUrl}
          onChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
        />
        {errors.coverImageUrl && (
          <p className="text-sm text-destructive">{errors.coverImageUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Galeria de fotos (opcional, até {MAX_GALLERY_IMAGES})
        </Label>
        {galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {galleryImages.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {galleryImages.length < MAX_GALLERY_IMAGES && (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                handleGalleryFilesSelect(event.target.files)
                event.target.value = ''
              }}
            />
            {uploadingGallery ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            Adicionar fotos
          </label>
        )}
        {galleryError && <p className="text-sm text-destructive">{galleryError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Conteúdo</Label>
        <RichTextEditor
          value={content}
          onChange={(html) => setValue('content', html, { shouldValidate: true })}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setValue('status', (value ?? 'draft') as PublicationStatus, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue>
                {(selectedStatus: PublicationStatus | null) => {
                  const found = STATUS_OPTIONS.find((option) => option.value === selectedStatus)
                  return found ? found.label : 'Status'
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input id="tags" placeholder="corrida, 5km, inscrições" {...register('tags')} />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="highlighted"
          checked={highlighted}
          onCheckedChange={(checked) => setValue('highlighted', checked)}
        />
        <Label htmlFor="highlighted">Publicação em destaque</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

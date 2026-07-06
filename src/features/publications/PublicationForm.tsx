import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Paperclip, X } from 'lucide-react'
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
import { uploadFile } from '@/services/imageUpload'
import type { Attachment, Category, PublicationStatus } from '@/types'

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
  defaultAttachments?: Attachment[]
  onSubmit: (values: PublicationFormValues, attachments: Attachment[]) => Promise<void>
  onCancel: () => void
}

export function PublicationForm({
  categories,
  defaultValues,
  defaultAttachments,
  onSubmit,
  onCancel,
}: PublicationFormProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(defaultAttachments ?? [])
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

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

  async function handleAttachmentSelect(file: File | undefined) {
    if (!file) {
      return
    }

    setAttachmentError(null)
    setUploadingAttachment(true)

    try {
      const attachment = await uploadFile(file)
      setAttachments((prev) => [...prev, attachment])
    } catch (error) {
      console.error('Failed to upload attachment', error)
      setAttachmentError('Não foi possível enviar o anexo.')
    } finally {
      setUploadingAttachment(false)
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((attachment) => attachment.url !== url))
  }

  async function submit(values: PublicationFormValues) {
    await onSubmit(values, attachments)
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

      <div className="flex flex-col gap-2">
        <Label>Anexos (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <span
              key={attachment.url}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              <Paperclip className="size-3" />
              {attachment.name}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.url)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="file"
            className="hidden"
            onChange={(event) => handleAttachmentSelect(event.target.files?.[0])}
          />
          {uploadingAttachment ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
          Adicionar anexo
        </label>
        {attachmentError && <p className="text-sm text-destructive">{attachmentError}</p>}
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

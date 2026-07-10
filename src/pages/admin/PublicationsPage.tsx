import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { getCategories } from '@/services/categories'
import {
  createPublication,
  deletePublication,
  getPublicationById,
  getPublications,
  setPublicationUpdates,
  updatePublication,
  type PublicationInput,
} from '@/services/publications'
import {
  PublicationForm,
  type PublicationFormValues,
} from '@/features/publications/PublicationForm'
import { PublicationUpdates } from '@/features/publications/PublicationUpdates'
import type { Attachment, Publication, PublicationStatus, PublicationUpdate } from '@/types'

const STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
}

function toFormValues(publication?: Publication | null): PublicationFormValues {
  if (!publication) {
    return {
      title: '',
      subtitle: '',
      categoryId: '',
      summary: '',
      coverImageUrl: '',
      content: '',
      author: '',
      date: new Date().toISOString().slice(0, 10),
      highlighted: false,
      status: 'draft',
      tags: '',
    }
  }

  return {
    title: publication.title,
    subtitle: publication.subtitle ?? '',
    categoryId: publication.categoryId,
    summary: publication.summary,
    coverImageUrl: publication.coverImageUrl,
    content: publication.content,
    author: publication.author,
    date: publication.date.toISOString().slice(0, 10),
    highlighted: publication.highlighted,
    status: publication.status,
    tags: publication.tags.join(', '),
  }
}

function toInput(
  values: PublicationFormValues,
  organizationId: string,
  attachments: Attachment[],
): PublicationInput {
  return {
    organizationId,
    title: values.title,
    subtitle: values.subtitle || undefined,
    categoryId: values.categoryId,
    summary: values.summary,
    coverImageUrl: values.coverImageUrl,
    content: values.content,
    author: values.author,
    date: new Date(values.date),
    highlighted: values.highlighted,
    status: values.status,
    tags: (values.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    attachments,
  }
}

export function PublicationsPage() {
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null)
  const [deletingPublication, setDeletingPublication] = useState<Publication | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: publications, isLoading } = useQuery({
    queryKey: ['publications', organizationId],
    queryFn: () => getPublications(organizationId),
    enabled: !!organizationId,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => getCategories(organizationId),
    enabled: !!organizationId,
  })

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>()
    categories?.forEach((category) => map.set(category.id, category.name))
    return map
  }, [categories])

  const filteredPublications = useMemo(() => {
    return (publications ?? []).filter((publication) => {
      const matchesSearch = publication.title.toLowerCase().includes(search.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || publication.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || publication.categoryId === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [publications, search, statusFilter, categoryFilter])

  const invalidatePublications = () =>
    queryClient.invalidateQueries({ queryKey: ['publications', organizationId] })

  const createMutation = useMutation({
    mutationFn: (input: PublicationInput) => createPublication(input),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PublicationInput }) =>
      updatePublication(id, input),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePublication(id),
  })

  function openCreateDialog() {
    setEditingPublication(null)
    setFormError(null)
    setDialogOpen(true)
  }

  function openEditDialog(publication: Publication) {
    setEditingPublication(publication)
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleSubmit(values: PublicationFormValues, attachments: Attachment[]) {
    setFormError(null)

    try {
      const input = toInput(values, organizationId, attachments)

      if (editingPublication) {
        await updateMutation.mutateAsync({ id: editingPublication.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }

      setDialogOpen(false)
      setEditingPublication(null)
      await invalidatePublications()
    } catch (error) {
      console.error('Failed to save publication', error)
      setFormError('Não foi possível salvar a publicação. Verifique os dados e tente novamente.')
    }
  }

  async function handleDelete(publication: Publication) {
    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(publication.id)
      queryClient.setQueryData<Publication[]>(['publications', organizationId], (old) =>
        (old ?? []).filter((item) => item.id !== publication.id),
      )
      setDeletingPublication(null)
    } catch (error) {
      console.error('Failed to delete publication', error)
      setDeleteError('Não foi possível excluir a publicação. Tente novamente.')
    }
  }

  async function refreshEditingPublication(id: string) {
    const refreshed = await getPublicationById(id)

    if (refreshed) {
      setEditingPublication(refreshed)
      queryClient.setQueryData<Publication[]>(['publications', organizationId], (old) =>
        (old ?? []).map((item) => (item.id === refreshed.id ? refreshed : item)),
      )
    }
  }

  async function handleAddUpdate(message: string) {
    if (!editingPublication || !appUser) {
      return
    }

    const newUpdate: PublicationUpdate = {
      id: crypto.randomUUID(),
      message,
      authorId: appUser.id,
      authorName: appUser.name,
      authorPhotoUrl: appUser.photoUrl,
      createdAt: new Date(),
    }

    await setPublicationUpdates(editingPublication.id, [
      ...(editingPublication.updates ?? []),
      newUpdate,
    ])
    await refreshEditingPublication(editingPublication.id)
  }

  async function handleEditUpdate(updateId: string, message: string) {
    if (!editingPublication) {
      return
    }

    const updated = (editingPublication.updates ?? []).map((update) =>
      update.id === updateId ? { ...update, message } : update,
    )

    await setPublicationUpdates(editingPublication.id, updated)
    await refreshEditingPublication(editingPublication.id)
  }

  async function handleDeleteUpdate(updateId: string) {
    if (!editingPublication) {
      return
    }

    const updated = (editingPublication.updates ?? []).filter(
      (update) => update.id !== updateId,
    )

    await setPublicationUpdates(editingPublication.id, updated)
    await refreshEditingPublication(editingPublication.id)
  }

  async function handleDuplicate(publication: Publication) {
    try {
      const input = toInput(
        { ...toFormValues(publication), title: `${publication.title} (cópia)`, status: 'draft' },
        organizationId,
        publication.attachments ?? [],
      )
      await createMutation.mutateAsync(input)
      await invalidatePublications()
    } catch (error) {
      console.error('Failed to duplicate publication', error)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Publicações</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nova publicação
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Pesquisar por título..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string | null) =>
                value && value !== 'all'
                  ? STATUS_LABELS[value as PublicationStatus]
                  : 'Todos os status'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value ?? 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string | null) =>
                value && value !== 'all' ? categoriesById.get(value) : 'Todas as categorias'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-36 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && filteredPublications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhuma publicação encontrada.
              </TableCell>
            </TableRow>
          )}

          {filteredPublications.map((publication) => (
            <TableRow key={publication.id}>
              <TableCell>
                {publication.coverImageUrl && (
                  <img
                    src={publication.coverImageUrl}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{publication.title}</div>
                {publication.highlighted && (
                  <span className="text-xs text-primary">Destaque</span>
                )}
              </TableCell>
              <TableCell>{categoriesById.get(publication.categoryId) ?? '—'}</TableCell>
              <TableCell>{publication.date.toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{STATUS_LABELS[publication.status]}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(publication)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDuplicate(publication)}>
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingPublication(publication)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPublication ? 'Editar publicação' : 'Nova publicação'}
            </DialogTitle>
          </DialogHeader>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {dialogOpen && (
            <PublicationForm
              key={editingPublication?.id ?? 'new'}
              categories={categories ?? []}
              defaultValues={toFormValues(editingPublication)}
              defaultAttachments={editingPublication?.attachments}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          )}

          {dialogOpen && editingPublication && (
            <div className="flex flex-col gap-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Atualizações</h3>
              <PublicationUpdates
                updates={editingPublication.updates ?? []}
                onAddUpdate={handleAddUpdate}
                onEditUpdate={handleEditUpdate}
                onDeleteUpdate={handleDeleteUpdate}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingPublication}
        onOpenChange={(open) => !open && setDeletingPublication(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingPublication?.title}"? Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPublication && handleDelete(deletingPublication)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

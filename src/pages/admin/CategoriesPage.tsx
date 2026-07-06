import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/services/categories'
import { CATEGORY_ICON_MAP } from '@/features/categories/constants'
import { CategoryForm, type CategoryFormValues } from '@/features/categories/CategoryForm'
import type { Category } from '@/types'

export function CategoriesPage() {
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => getCategories(organizationId),
    enabled: !!organizationId,
  })

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['categories', organizationId] })

  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      createCategory({ ...values, organizationId }),
  })

  const updateMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      updateCategory(editingCategory!.id, { ...values, organizationId }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
  })

  function openCreateDialog() {
    setEditingCategory(null)
    setFormError(null)
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setFormError(null)
    setDialogOpen(true)
  }

  const defaultValues: CategoryFormValues = editingCategory
    ? {
        name: editingCategory.name,
        description: editingCategory.description ?? '',
        icon: editingCategory.icon,
        color: editingCategory.color,
        order: editingCategory.order,
        active: editingCategory.active,
      }
    : {
        name: '',
        description: '',
        icon: '',
        color: '',
        order: categories?.length ?? 0,
        active: true,
      }

  async function handleSubmit(values: CategoryFormValues) {
    setFormError(null)

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(values)
      }

      setDialogOpen(false)
      setEditingCategory(null)
      await invalidateCategories()
    } catch (error) {
      console.error('Failed to save category', error)
      setFormError('Não foi possível salvar a categoria. Verifique os dados e tente novamente.')
    }
  }

  async function handleDelete(category: Category) {
    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(category.id)
      setDeletingCategory(null)
      await invalidateCategories()
    } catch (error) {
      console.error('Failed to delete category', error)
      setDeleteError('Não foi possível excluir a categoria. Tente novamente.')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Ordem</TableHead>
            <TableHead className="w-16">Ícone</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && categories?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhuma categoria cadastrada ainda.
              </TableCell>
            </TableRow>
          )}

          {categories?.map((category) => {
            const Icon = CATEGORY_ICON_MAP[category.icon]

            return (
              <TableRow key={category.id}>
                <TableCell>{category.order}</TableCell>
                <TableCell>
                  <span
                    className="flex size-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {Icon && <Icon className="size-4" />}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground">
                      {category.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>{category.active ? 'Ativa' : 'Inativa'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          </DialogHeader>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <CategoryForm
            key={editingCategory?.id ?? 'new'}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingCategory && handleDelete(deletingCategory)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
  createUser,
  deleteUserProfile,
  getUsers,
  updateUserProfile,
} from '@/services/users'
import { UserForm, type UserFormValues } from '@/features/users/UserForm'
import type { AppUser, UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  reader: 'Leitor',
}

export function UsersPage() {
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', organizationId],
    queryFn: () => getUsers(organizationId),
    enabled: !!organizationId,
  })

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['users', organizationId] })

  const createMutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      createUser({
        organizationId,
        name: values.name,
        role: values.role,
        password: values.password ?? '',
        phone: values.identifier?.includes('@') ? undefined : values.identifier,
        email: values.identifier?.includes('@') ? values.identifier : undefined,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) =>
      updateUserProfile(id, { name: values.name, role: values.role }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserProfile(id),
  })

  function openCreateDialog() {
    setEditingUser(null)
    setFormError(null)
    setDialogOpen(true)
  }

  function openEditDialog(user: AppUser) {
    setEditingUser(user)
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleSubmit(values: UserFormValues) {
    setFormError(null)

    try {
      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, values })
      } else {
        await createMutation.mutateAsync(values)
      }

      setDialogOpen(false)
      setEditingUser(null)
      await invalidateUsers()
    } catch (error) {
      console.error('Failed to save user', error)
      setFormError('Não foi possível salvar o usuário. Verifique os dados e tente novamente.')
    }
  }

  async function handleDelete(user: AppUser) {
    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(user.id)
      setDeletingUser(null)
      await invalidateUsers()
    } catch (error) {
      console.error('Failed to delete user profile', error)
      setDeleteError('Não foi possível remover o usuário. Tente novamente.')
    }
  }

  const defaultValues: UserFormValues = editingUser
    ? { name: editingUser.name, role: editingUser.role }
    : { name: '', identifier: '', password: '', role: 'reader' }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Novo usuário
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone / E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && users?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Nenhum usuário cadastrado ainda.
              </TableCell>
            </TableRow>
          )}

          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.phone ?? user.email ?? '—'}</TableCell>
              <TableCell>{ROLE_LABELS[user.role]}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={user.id === appUser?.id}
                    onClick={() => setDeletingUser(user)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          </DialogHeader>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {dialogOpen && (
            <UserForm
              key={editingUser?.id ?? 'new'}
              mode={editingUser ? 'edit' : 'create'}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove o perfil de "{deletingUser?.name}" e bloqueia o acesso dela ao mural. A
              conta de login não é excluída (isso só pode ser feito manualmente no Firebase
              Console, se necessário).
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingUser && handleDelete(deletingUser)}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

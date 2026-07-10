import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'reader', label: 'Leitor' },
]

const createUserSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  identifier: z.string().min(1, 'Informe o telefone ou e-mail'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'editor', 'reader']),
})

const editUserSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  role: z.enum(['admin', 'editor', 'reader']),
})

export interface UserFormValues {
  name: string
  identifier?: string
  password?: string
  role: UserRole
}

interface UserFormProps {
  mode: 'create' | 'edit'
  defaultValues: UserFormValues
  onSubmit: (values: UserFormValues) => Promise<void>
  onCancel: () => void
}

export function UserForm({ mode, defaultValues, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(mode === 'create' ? createUserSchema : editUserSchema),
    defaultValues,
  })

  const role = watch('role')

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {mode === 'create' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="identifier">Telefone ou e-mail</Label>
            <Input id="identifier" placeholder="11987654321" {...register('identifier')} />
            {errors.identifier && (
              <p className="text-sm text-destructive">{errors.identifier.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label>Perfil</Label>
        <Select
          value={role}
          onValueChange={(value) => setValue('role', (value ?? 'reader') as UserRole)}
        >
          <SelectTrigger>
            <SelectValue>
              {(selected: UserRole | null) =>
                ROLE_OPTIONS.find((option) => option.value === selected)?.label ?? 'Perfil'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

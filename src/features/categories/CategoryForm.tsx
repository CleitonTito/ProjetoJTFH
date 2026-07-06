import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { CATEGORY_COLORS, CATEGORY_ICONS } from './constants'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Escolha um ícone'),
  color: z.string().min(1, 'Escolha uma cor'),
  order: z.number().int().min(0, 'A ordem deve ser 0 ou maior'),
  active: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  defaultValues: CategoryFormValues
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ defaultValues, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  })

  const icon = watch('icon')
  const color = watch('color')
  const active = watch('active')

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register('description')} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ícone</Label>
        <Select
          value={icon}
          onValueChange={(value) => setValue('icon', value ?? '', { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Escolha um ícone" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_ICONS.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => setValue('color', value, { shouldValidate: true })}
              className="size-8 rounded-full border-2"
              style={{
                backgroundColor: value,
                borderColor: color === value ? 'var(--foreground)' : 'transparent',
              }}
            />
          ))}
        </div>
        {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="order">Ordem de exibição</Label>
        <Input id="order" type="number" {...register('order', { valueAsNumber: true })} />
        {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={(checked) => setValue('active', checked)}
        />
        <Label htmlFor="active">Ativa</Label>
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

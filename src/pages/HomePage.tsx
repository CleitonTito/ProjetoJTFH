import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { getCategories } from '@/services/categories'
import { getPublications } from '@/services/publications'
import { PublicationCard } from '@/features/publications/PublicationCard'

export function HomePage() {
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

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

  const published = useMemo(
    () => (publications ?? []).filter((publication) => publication.status === 'published'),
    [publications],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return published.filter((publication) => {
      const matchesCategory =
        categoryFilter === 'all' || publication.categoryId === categoryFilter

      const matchesSearch =
        !term ||
        publication.title.toLowerCase().includes(term) ||
        publication.summary.toLowerCase().includes(term) ||
        publication.author.toLowerCase().includes(term) ||
        publication.tags.some((tag) => tag.toLowerCase().includes(term)) ||
        (categoriesById.get(publication.categoryId) ?? '').toLowerCase().includes(term)

      return matchesCategory && matchesSearch
    })
  }, [published, search, categoryFilter, categoriesById])

  const highlighted = filtered.filter((publication) => publication.highlighted)

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mural de Informações</h1>
        <p className="text-muted-foreground">Avisos e novidades do Projeto JTFH</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
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

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      {!isLoading && highlighted.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Destaques</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlighted.map((publication) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                categoryName={categoriesById.get(publication.categoryId)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Últimas publicações</h2>
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground">Nenhuma publicação encontrada.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((publication) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              categoryName={categoriesById.get(publication.categoryId)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

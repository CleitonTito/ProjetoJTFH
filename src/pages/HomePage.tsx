import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
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
  // Uma publicação em destaque não repete embaixo — evita mostrar o mesmo
  // card duas vezes (uma em "Destaques", outra em "Últimas publicações").
  const rest = filtered.filter((publication) => !publication.highlighted)

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden border-b border-white/10 px-6 py-14 sm:py-20">
        <div
          aria-hidden
          className="animate-blob-a pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob-b pointer-events-none absolute -top-16 right-0 size-80 rounded-full bg-brand-blue/20 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob-a pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-brand-energy/10 blur-3xl"
          style={{ animationDelay: '-7s' }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-3">
          <span className="w-fit rounded-full bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Projeto JTFH
          </span>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Mural de{' '}
            <span className="bg-gradient-to-r from-primary via-brand-blue to-brand-energy bg-clip-text text-transparent">
              Informações
            </span>
          </h1>
          <p className="max-w-lg text-muted-foreground">Avisos e novidades do Projeto JTFH</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-10">
        <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="border-white/10 bg-background/60 pl-8"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value ?? 'all')}
          >
            <SelectTrigger className="w-48 border-white/10 bg-background/60">
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
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-brand-energy" />
              Destaques
            </h2>
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

        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground">Nenhuma publicação encontrada.</p>
        )}

        {!isLoading && rest.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-blue to-primary" />
              Últimas publicações
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((publication) => (
                <PublicationCard
                  key={publication.id}
                  publication={publication}
                  categoryName={categoriesById.get(publication.categoryId)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

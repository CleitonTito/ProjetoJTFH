import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getCategories } from '@/services/categories'
import { getPublications } from '@/services/publications'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
    </div>
  )
}

export function DashboardPage() {
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''

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

  const stats = useMemo(() => {
    const list = publications ?? []
    return {
      total: list.length,
      published: list.filter((p) => p.status === 'published').length,
      draft: list.filter((p) => p.status === 'draft').length,
      archived: list.filter((p) => p.status === 'archived').length,
    }
  }, [publications])

  const categoryUsage = useMemo(() => {
    const counts = new Map<string, number>()
    publications?.forEach((publication) => {
      counts.set(publication.categoryId, (counts.get(publication.categoryId) ?? 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([categoryId, count]) => ({
        categoryId,
        count,
        name: categories?.find((category) => category.id === categoryId)?.name ?? 'Sem categoria',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [publications, categories])

  const recentPublications = useMemo(() => (publications ?? []).slice(0, 5), [publications])

  const maxCategoryCount = Math.max(...categoryUsage.map((item) => item.count), 1)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Carregando...</p>
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total de publicações" value={stats.total} />
        <StatTile label="Publicadas" value={stats.published} />
        <StatTile label="Rascunhos" value={stats.draft} />
        <StatTile label="Arquivadas" value={stats.archived} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Categorias mais utilizadas</h2>
          {categoryUsage.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma publicação ainda.</p>
          )}
          <div className="flex flex-col gap-2">
            {categoryUsage.map((item) => (
              <div key={item.categoryId} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm">{item.name}</span>
                <div className="h-6 flex-1 rounded-md bg-muted">
                  <div
                    className="h-6 rounded-md bg-primary"
                    style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Últimas publicações</h2>
          {recentPublications.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma publicação ainda.</p>
          )}
          <div className="flex flex-col gap-2">
            {recentPublications.map((publication) => (
              <Link
                key={publication.id}
                to={`/publicacoes/${publication.id}`}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="truncate font-medium">{publication.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {STATUS_LABELS[publication.status]} ·{' '}
                  {publication.date.toLocaleDateString('pt-BR')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

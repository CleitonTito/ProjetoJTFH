import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Paperclip } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getCategories } from '@/services/categories'
import { getPublicationById, getPublications } from '@/services/publications'
import { PublicationCard } from '@/features/publications/PublicationCard'
import { LoadingScreen } from '@/components/LoadingScreen'

export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { appUser } = useAuth()
  const organizationId = appUser?.organizationId ?? ''

  const { data: publication, isLoading } = useQuery({
    queryKey: ['publication', id],
    queryFn: () => getPublicationById(id!),
    enabled: !!id,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => getCategories(organizationId),
    enabled: !!organizationId,
  })

  const { data: allPublications } = useQuery({
    queryKey: ['publications', organizationId],
    queryFn: () => getPublications(organizationId),
    enabled: !!organizationId,
  })

  const categoryName = categories?.find((category) => category.id === publication?.categoryId)
    ?.name

  const related = useMemo(() => {
    if (!publication || !allPublications) {
      return []
    }

    return allPublications
      .filter(
        (item) =>
          item.id !== publication.id &&
          item.categoryId === publication.categoryId &&
          item.status === 'published',
      )
      .slice(0, 3)
  }, [publication, allPublications])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!publication) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <p className="text-muted-foreground">Publicação não encontrada.</p>
        <Link to="/" className="text-primary underline">
          Voltar para o mural
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar para o mural
      </Link>

      <img
        src={publication.coverImageUrl}
        alt=""
        className="aspect-video w-full rounded-lg object-cover"
      />

      <div className="flex flex-col gap-2">
        {categoryName && (
          <span className="w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {categoryName}
          </span>
        )}
        <h1 className="text-2xl font-semibold">{publication.title}</h1>
        {publication.subtitle && (
          <p className="text-lg text-muted-foreground">{publication.subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {publication.date.toLocaleDateString('pt-BR')} · {publication.author}
        </p>
      </div>

      <div
        className="rich-text-editor max-w-none"
        dangerouslySetInnerHTML={{ __html: publication.content }}
      />

      {publication.attachments && publication.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Anexos</h2>
          <div className="flex flex-wrap gap-2">
            {publication.attachments.map((attachment) => (
              <a
                key={attachment.url}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
              >
                <Paperclip className="size-3" />
                {attachment.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Publicações relacionadas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PublicationCard key={item.id} publication={item} categoryName={categoryName} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Publication } from '@/types'

interface PublicationCardProps {
  publication: Publication
  categoryName?: string
}

export function PublicationCard({ publication, categoryName }: PublicationCardProps) {
  return (
    <Card className="flex flex-col">
      <img
        src={publication.coverImageUrl}
        alt=""
        className="aspect-video w-full bg-muted object-contain"
      />
      <CardContent className="flex flex-1 flex-col gap-2">
        {categoryName && (
          <span className="w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {categoryName}
          </span>
        )}
        <h3 className="font-heading leading-tight font-semibold">{publication.title}</h3>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{publication.summary}</p>
        <p className="text-xs text-muted-foreground">
          {publication.date.toLocaleDateString('pt-BR')}
        </p>
      </CardContent>
      <CardFooter>
        <Link
          to={`/publicacoes/${publication.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
        >
          Ler mais
        </Link>
      </CardFooter>
    </Card>
  )
}

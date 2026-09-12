import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
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
    <Card className="relative flex flex-col border-white/10 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary),transparent_50%),0_20px_40px_-16px_var(--primary)]">
      {publication.highlighted && (
        <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-energy to-primary px-2 py-0.5 text-xs font-semibold text-white shadow-md">
          <Zap className="size-3" />
          Destaque
        </span>
      )}
      <div className="overflow-hidden">
        <img
          src={publication.coverImageUrl}
          alt=""
          className="aspect-video w-full bg-muted object-contain transition-transform duration-300 group-hover/card:scale-[1.03]"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-2">
        {categoryName && (
          <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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

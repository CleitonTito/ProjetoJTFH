import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getInitials } from '@/utils/initials'
import type { PublicationUpdate } from '@/types'

interface PublicationUpdatesProps {
  updates: PublicationUpdate[]
  onAddUpdate?: (message: string) => Promise<void>
}

export function PublicationUpdates({ updates, onAddUpdate }: PublicationUpdatesProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!message.trim() || !onAddUpdate) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onAddUpdate(message.trim())
      setMessage('')
    } catch (err) {
      console.error('Failed to add update', err)
      setError('Não foi possível adicionar a atualização.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {onAddUpdate && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Escreva uma nova atualização sobre este evento..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={submitting || !message.trim()}
              onClick={handleAdd}
            >
              {submitting ? 'Adicionando...' : 'Adicionar atualização'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma atualização ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <div key={update.id} className="flex gap-3">
              <Avatar size="sm">
                {update.authorPhotoUrl && (
                  <AvatarImage src={update.authorPhotoUrl} alt={update.authorName} />
                )}
                <AvatarFallback>{getInitials(update.authorName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{update.authorName}</span>
                  <span>
                    {update.createdAt.toLocaleDateString('pt-BR')}{' '}
                    {update.createdAt.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm">{update.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

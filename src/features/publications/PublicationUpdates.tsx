import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ImageUpload'
import { getInitials } from '@/utils/initials'
import type { PublicationUpdate } from '@/types'

interface PublicationUpdatesProps {
  updates: PublicationUpdate[]
  onAddUpdate?: (message: string, imageUrl?: string) => Promise<void>
  onEditUpdate?: (id: string, message: string, imageUrl?: string) => Promise<void>
  onDeleteUpdate?: (id: string) => Promise<void>
}

export function PublicationUpdates({
  updates,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
}: PublicationUpdatesProps) {
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [editingImageUrl, setEditingImageUrl] = useState('')

  const canManage = !!onEditUpdate || !!onDeleteUpdate

  async function handleAdd() {
    if (!message.trim() || !onAddUpdate) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onAddUpdate(message.trim(), imageUrl || undefined)
      setMessage('')
      setImageUrl('')
    } catch (err) {
      console.error('Failed to add update', err)
      setError('Não foi possível adicionar a atualização.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEditing(update: PublicationUpdate) {
    setError(null)
    setEditingId(update.id)
    setEditingMessage(update.message)
    setEditingImageUrl(update.imageUrl ?? '')
  }

  async function saveEdit(id: string) {
    if (!onEditUpdate || !editingMessage.trim()) {
      return
    }

    try {
      await onEditUpdate(id, editingMessage.trim(), editingImageUrl || undefined)
      setEditingId(null)
    } catch (err) {
      console.error('Failed to edit update', err)
      setError('Não foi possível editar a atualização.')
    }
  }

  async function handleDelete(id: string) {
    if (!onDeleteUpdate) {
      return
    }

    if (!window.confirm('Excluir essa atualização?')) {
      return
    }

    try {
      await onDeleteUpdate(id)
    } catch (err) {
      console.error('Failed to delete update', err)
      setError('Não foi possível excluir a atualização.')
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
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
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
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

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
              <div className="flex flex-1 flex-col gap-0.5">
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

                {editingId === update.id ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editingMessage}
                      onChange={(event) => setEditingMessage(event.target.value)}
                    />
                    <ImageUpload value={editingImageUrl} onChange={setEditingImageUrl} />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!editingMessage.trim()}
                        onClick={() => saveEdit(update.id)}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm">{update.message}</p>
                      {update.imageUrl && (
                        <img
                          src={update.imageUrl}
                          alt=""
                          className="max-h-48 w-full max-w-xs rounded-md bg-muted object-contain"
                        />
                      )}
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        {onEditUpdate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => startEditing(update)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {onDeleteUpdate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(update.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

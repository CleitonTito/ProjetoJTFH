import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SharePublicationProps {
  title: string
  author: string
  hasUpdates: boolean
  url?: string
}

export function SharePublication({ title, author, hasUpdates, url }: SharePublicationProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url ?? window.location.href

  function handleWhatsAppShare() {
    const intro = hasUpdates
      ? `🔄 Oba! ${author} trouxe informação nova sobre`
      : `📢 Oba! ${author} acabou de lançar uma novidade:`
    const message = `${intro}\n*${title}*\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleWhatsAppShare}>
        <MessageCircle className="size-4" />
        WhatsApp
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Link copiado!' : 'Copiar link'}
      </Button>
    </div>
  )
}

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Unhandled render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold">Algo deu errado.</p>
          <p className="text-sm text-muted-foreground">
            Tente recarregar a página. Se o problema continuar, tente abrir o link num navegador
            em vez do navegador embutido do WhatsApp.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </div>
      )
    }

    return this.props.children
  }
}

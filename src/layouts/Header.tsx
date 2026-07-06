import { Link } from 'react-router-dom'
import logoCorre from '@/assets/branding/logo-corre.png'
import { Button } from '@/components/ui/button'
import { signOut } from '@/firebase/auth'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { appUser } = useAuth()

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logoCorre}
          alt="Projeto JTFH"
          className="h-12 w-12 rounded-full object-cover"
        />
        <span className="text-lg font-semibold">Mural de Informações</span>
      </Link>
      <nav className="flex items-center gap-4">
        {(appUser?.role === 'admin' || appUser?.role === 'editor') && (
          <Link to="/admin/publicacoes" className="text-sm font-medium hover:underline">
            Publicações
          </Link>
        )}
        {appUser?.role === 'admin' && (
          <Link to="/admin/categorias" className="text-sm font-medium hover:underline">
            Categorias
          </Link>
        )}
        <Button variant="outline" onClick={() => signOut()}>
          Sair
        </Button>
      </nav>
    </header>
  )
}

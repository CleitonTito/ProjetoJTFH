import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import logoCorre from '@/assets/branding/logo-corre.png'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { signOut } from '@/firebase/auth'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { appUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const canSeeDashboard = appUser?.role === 'admin'
  const canSeePublications = appUser?.role === 'admin' || appUser?.role === 'editor'
  const canSeeCategories = appUser?.role === 'admin'

  const navLinks = (
    <>
      {canSeeDashboard && (
        <Link
          to="/admin/dashboard"
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium hover:underline"
        >
          Dashboard
        </Link>
      )}
      {canSeePublications && (
        <Link
          to="/admin/publicacoes"
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium hover:underline"
        >
          Publicações
        </Link>
      )}
      {canSeeCategories && (
        <Link
          to="/admin/categorias"
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium hover:underline"
        >
          Categorias
        </Link>
      )}
    </>
  )

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2 sm:gap-3">
        <img
          src={logoCorre}
          alt="Projeto JTFH"
          className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
        />
        <span className="text-base font-semibold sm:text-lg">Mural de Informações</span>
      </Link>

      <nav className="hidden items-center gap-4 sm:flex">
        {navLinks}
        <Button variant="outline" onClick={() => signOut()}>
          Sair
        </Button>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="sm:hidden" />}>
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">{navLinks}</div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
            >
              Sair
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { Menu } from 'lucide-react'
import logoCorre from '@/assets/branding/logo-corre.png'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { changePassword, signOut } from '@/firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import {
  ChangePasswordForm,
  type ChangePasswordFormValues,
} from '@/features/auth/ChangePasswordForm'

export function Header() {
  const { appUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function openPasswordDialog() {
    setMenuOpen(false)
    setPasswordError(null)
    setPasswordDialogOpen(true)
  }

  async function handleChangePassword(values: ChangePasswordFormValues) {
    setPasswordError(null)

    try {
      await changePassword(values.currentPassword, values.newPassword)
      setPasswordDialogOpen(false)
    } catch (error) {
      console.error('Failed to change password', error)

      if (
        error instanceof FirebaseError &&
        (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password')
      ) {
        setPasswordError('Senha atual incorreta.')
      } else if (error instanceof FirebaseError && error.code === 'auth/weak-password') {
        setPasswordError('A nova senha é muito fraca.')
      } else {
        setPasswordError('Não foi possível trocar a senha. Tente novamente.')
      }
    }
  }

  const canSeeDashboard = appUser?.role === 'admin'
  const canSeePublications = appUser?.role === 'admin' || appUser?.role === 'editor'
  const canSeeCategories = appUser?.role === 'admin'
  const canSeeUsers = appUser?.role === 'admin'

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
      {canSeeUsers && (
        <Link
          to="/admin/usuarios"
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium hover:underline"
        >
          Usuários
        </Link>
      )}
      <button
        type="button"
        onClick={openPasswordDialog}
        className="text-left text-sm font-medium hover:underline"
      >
        Trocar senha
      </button>
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

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar senha</DialogTitle>
          </DialogHeader>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          {passwordDialogOpen && (
            <ChangePasswordForm
              onSubmit={handleChangePassword}
              onCancel={() => setPasswordDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}

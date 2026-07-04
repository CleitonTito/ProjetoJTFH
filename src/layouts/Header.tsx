import logoCorre from '@/assets/branding/logo-corre.png'
import { Button } from '@/components/ui/button'
import { signOut } from '@/firebase/auth'

export function Header() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <img
          src={logoCorre}
          alt="Projeto JTFH"
          className="h-12 w-12 rounded-full object-cover"
        />
        <span className="text-lg font-semibold">Mural de Informações</span>
      </div>
      <Button variant="outline" onClick={() => signOut()}>
        Sair
      </Button>
    </header>
  )
}

import logoJtfh from '@/assets/branding/logo-jtfh.png'

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t px-6 py-4 text-sm text-muted-foreground">
      <img src={logoJtfh} alt="Projeto JTFH" className="h-10 w-10 object-contain" />
      <p>© {new Date().getFullYear()} Projeto JTFH — Mural de Informações</p>
    </footer>
  )
}

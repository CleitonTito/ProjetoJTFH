import logoJtfh from '@/assets/branding/logo-jtfh.png'

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-white/10 bg-black/20 px-6 py-6 text-sm text-muted-foreground">
      <img
        src={logoJtfh}
        alt="Projeto JTFH"
        className="h-10 w-10 rounded-full bg-white object-contain p-1 shadow-sm"
      />
      <p>© {new Date().getFullYear()} Projeto JTFH — Mural de Informações</p>
    </footer>
  )
}

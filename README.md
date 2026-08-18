# Mural de Informações — Projeto JTFH

CMS interno criado para o **Projeto JTFH** (grupo de corrida de rua) com um objetivo simples: acabar com avisos soltos e repetidos numa conversa de grupo. Em vez disso, os organizadores publicam um comunicado (corrida, treino, etc.) num mural centralizado, pesquisável e categorizado — e podem **atualizar esse mesmo aviso** conforme surgem novidades, sem precisar reescrever tudo do zero.

🔗 **Demo online:** [projeto-jtfh.vercel.app](https://projeto-jtfh.vercel.app)
> Peça as credenciais de acesso de demonstração pra experimentar o painel administrativo.

## Funcionalidades

- **Login** por e-mail ou telefone.
- **Mural público** (autenticado): busca, filtro por categoria, seção de destaques e últimas publicações.
- **Publicações** (admin/editor): CRUD completo com imagem de capa, editor de texto rico (Tiptap), anexos, tags, destaque, status (rascunho/publicado/arquivado), duplicar, filtros e busca.
- **Atualizações incrementais**: cada publicação pode receber novas atualizações (mensagem + imagem opcional + autor + data) sem virar um post novo — o problema que motivou o projeto.
- **Categorias** (admin): CRUD com ícone e cor.
- **Usuários** (admin): criação, edição de perfil (admin/editor/leitor) e revogação de acesso.
- **Dashboard** (admin): contadores por status e categorias mais usadas.
- **Multi-tenant ready**: todo o modelo de dados já isola por `organizationId`, preparado para múltiplas organizações no futuro.

## Stack

React 19 + Vite + TypeScript + Tailwind CSS v4 + Shadcn/UI (`@base-ui/react`) + React Router + React Hook Form + Zod + TanStack Query + Firebase (Auth + Firestore) + Tiptap + Cloudinary (upload de imagens).

Deploy: Vercel (deploy automático a cada push na branch `main`).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com suas credenciais de Firebase e Cloudinary
npm run dev
```

```bash
npm run build   # typecheck + build de produção
```

As regras de segurança do Firestore estão em `firestore.rules` e precisam ser publicadas manualmente no Firebase Console (Firestore Database → Regras) — não há deploy automático de regras neste projeto.

## Autor

Desenvolvido por [Cleiton Tito](https://github.com/CleitonTito).

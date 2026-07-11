# Contexto do Projeto — Mural de Informações (ProjetoJTFH)

> Este arquivo existe para dar continuidade ao desenvolvimento em uma sessão futura.
> Leia antes de continuar: explica o que já foi feito, por que certas decisões
> foram tomadas (inclusive desvios da especificação original) e o que falta.

A especificação original do projeto está em `Prompt_Mural_de_Informacoes.md`, na raiz
deste repositório.

## O que é o projeto

CMS interno para o **Projeto JTFH** (grupo de corrida de rua), pensado para reduzir
o volume de perguntas repetidas no grupo: em vez de avisos soltos numa conversa,
os organizadores publicam um "aviso" (corrida, treino, etc.) num mural
centralizado, pesquisável, categorizado, e conseguem **atualizar** esse mesmo
aviso conforme surgem novidades, em vez de reescrever tudo de novo.

- **Dono do projeto:** Jarbas (perfil admin)
- **Quem posta avisos de corrida:** Regina (perfil editor)
- **Desenvolvedor/mantenedor:** Cleiton Tito (perfil admin, é quem conversa com o Claude)

## Onde as coisas estão

| O quê | Onde |
|---|---|
| Repositório local | `C:\Projetos\ProjetoJTFH\MuralInformacoesProjetoJTFC\ProjetoJTFH` |
| GitHub | `https://github.com/CleitonTito/ProjetoJTFH` (branch `main`, deploy automático a cada push) |
| Produção | `https://projeto-jtfh.vercel.app` |
| Firebase (Auth + Firestore) | Projeto `mural-informacoes-projetojtfh`, região `southamerica-east1` |
| Cloudinary (upload de imagem/anexo) | Cloud name `jhzrgv9f`, upload preset unsigned `mural-projeto-JTFH` |
| Variáveis de ambiente locais | `.env` (gitignored) — ver `.env.example` pros nomes |
| Variáveis de ambiente na Vercel | Painel → Settings → **Environment Variables** (não confundir com "Environments", que é outra aba, feature paga) |

## Stack real (com desvios da especificação original)

React + Vite + TypeScript + Tailwind CSS v4 + Shadcn/UI + React Router + React Hook
Form + Zod + TanStack Query + Firebase (Auth + Firestore) + Tiptap (editor de texto).

**Desvios importantes em relação ao prompt original:**

1. **Sem Firebase Storage.** O Storage do Firebase passou a exigir plano pago
   (Blaze) mesmo pra uso mínimo. Usamos **Cloudinary** no lugar (upload direto do
   navegador via preset "unsigned", sem precisar de backend). `ImageKit` foi
   cogitado e descartado por exigir uma função serverless de assinatura.
2. **Shadcn/UI aqui usa `@base-ui/react` por baixo, não Radix.** Isso importa
   porque a API de alguns componentes difere do que é comum em tutoriais Shadcn
   (ex: `Select.Value` não deriva o rótulo automaticamente do valor — veja
   "Armadilhas conhecidas" abaixo).
3. **Login por telefone** além de e-mail — ver seção própria abaixo.

## Autenticação (login por telefone e por e-mail)

O Firebase Authentication não tem login nativo por número de telefone sem
SMS/OTP pago. Solução: `src/utils/phoneAuth.ts` (`toAuthEmail`) converte o valor
digitado num e-mail sintético:
- Se contém `@`, usa como e-mail real, sem alterar.
- Senão, extrai só os dígitos e monta `{digitos}@mural.jtfh.internal`.

**Padrão pra criar novo usuário manualmente no Firebase Console (Authentication):**
e-mail = `{DDD+número, só dígitos}@mural.jtfh.internal` (sem `.com` no final —
já rolou esse erro de digitação uma vez).

Perfis (`role` em `AppUser`): `admin`, `editor`, `reader`.

### Tela de gerenciamento de usuários (`/admin/usuarios`, só admin)

Criar usuário pela própria tela do app usa um truque: uma **segunda instância do
Firebase App** (`getSecondaryAuth()` em `src/firebase/config.ts`) só pra chamar
`createUserWithEmailAndPassword`, porque o SDK loga automaticamente como a conta
recém-criada na instância usada — sem isso, o admin seria deslogado no meio do
processo.

**Limitação real:** não é possível excluir a conta de login (Firebase
Authentication) de **outra** pessoa pelo navegador — só a Admin SDK (que exige
servidor) faz isso, ou a própria pessoa excluindo a si mesma. Por isso "Excluir
usuário" no app só remove o **documento no Firestore** (`users/{uid}`), o que já
bloqueia o acesso ao mural (nosso `AuthContext` exige esse documento pra liberar
entrada), mas a conta técnica do Firebase Authentication continua existindo até
alguém excluir manualmente no Console.

## Modelo de dados (Firestore)

Coleções: `organizations`, `users`, `categories`, `publications`. Só existe uma
organização até agora: `organizations/projeto-jtfh`. Todo tipo em `src/types/`
já carrega `organizationId` (preparado pra multi-tenant futuro, mas sem UI de
múltiplas organizações ainda).

- **`Publication`** (`src/types/publication.ts`): título, subtítulo?, categoria,
  resumo, imagem de capa, conteúdo (HTML gerado pelo Tiptap), autor, data,
  destaque (bool), status (`draft`/`published`/`archived`), tags[], anexos?
  (`Attachment[]`: nome/url/tamanho/tipo, via Cloudinary), **updates?**
  (`PublicationUpdate[]`: id/mensagem/imagem?/autor/data — ver abaixo).
- **`Category`**: nome, descrição?, ícone (de uma lista curada em
  `src/features/categories/constants.ts`), cor (de uma paleta curada), ordem,
  ativa/inativa.
- **`AppUser`**: organizationId, nome, e-mail?, telefone?, perfil, foto?.

### Atualizações de publicação (`PublicationUpdate[]`)

Pensado pra resolver exatamente o problema que motivou o projeto: em vez de criar
um aviso novo toda vez que algo muda (local, horário...), dá pra **adicionar uma
atualização** dentro do mesmo aviso, com mensagem + imagem opcional + autor
(avatar com iniciais, sem foto real ainda) + data/hora. Implementado como
**array completo sobrescrito a cada mutação** (`setPublicationUpdates` em
`src/services/publications.ts`, não usa `arrayUnion`/`arrayRemove`), porque isso
permite editar e excluir uma entrada específica do array de forma simples
(calcula o array novo no cliente e regrava tudo).

## Firestore Rules

Vivem em `firestore.rules` no repo, mas **precisam ser publicadas manualmente**
no Firebase Console (Firestore Database → Regras → colar → Publicar) toda vez
que mudam — não usamos Firebase CLI/deploy automático de regras. Sempre que
alterar esse arquivo, lembrar de avisar pra publicar antes de testar.

Regra geral: leitura de `categories`/`publications` liberada pra qualquer
autenticado da mesma organização; escrita de `categories` só admin; escrita de
`publications` admin+editor; `users` cada um lê o próprio documento, e admin lê/
cria/edita/exclui qualquer usuário da própria organização.

## Armadilhas conhecidas (leia antes de "descobrir" de novo)

1. **Índice composto do Firestore.** Toda query com `where(...)` + `orderBy(...)`
   em campos diferentes exige um índice composto — só passa a dar erro quando os
   dados realmente forçam essa combinação (pode passar despercebido com poucos
   documentos). O erro (`FirebaseError: The query requires an index`) tem um link
   direto de criação. **Configuramos um `QueryCache({ onError: console.error })`**
   no `main.tsx` porque, por padrão, o React Query engole esse erro
   silenciosamente sem imprimir nada.
2. **`serverTimestamp()` chega como `null`** na primeira leitura, antes do valor
   ser confirmado pelo servidor. Sempre ler com
   `data.campo?.toDate() ?? new Date()`, nunca `data.campo.toDate()` direto.
3. **Fechar Dialog/AlertDialog *antes* de invalidar/atualizar a query**, não
   depois — se a lista mudar enquanto o diálogo ainda está saindo (animação),
   o React quebra com `NotFoundError: removeChild/insertBefore`.
4. **`UID` é variável reservada do bash** (ID numérico do usuário do sistema) —
   nunca usar esse nome em scripts do Cloud Shell; usar `FIREBASE_UID`.
5. **Grande pegadinha:** o **Google Tradutor** (ou extensão parecida) ativo numa
   aba reescreve nós de texto do DOM por fora do React e causa exatamente esses
   dois sintomas: texto cortado de forma bizarra (ex: título "Destaques" virando
   só "S") e os crashes `NotFoundError: removeChild/insertBefore`. **Sempre
   verificar se a tradução automática está ativa antes de investigar a fundo.**
6. **`Select.Value` do Shadcn/Base UI não deriva o rótulo do valor sozinho** —
   precisa de uma função `children={(value) => ...}` explícita, e essa função
   deve **sempre retornar o mesmo tipo de nó** (string simples, ou sempre
   elemento) nos dois ramos (valor selecionado vs. placeholder), senão trava com
   o mesmo `NotFoundError` do item 3/5 (fica ainda mais difícil de diagnosticar
   se a tradução automática também estiver ativa ao mesmo tempo).
7. **`vercel.json` com rewrite pra SPA é obrigatório** — sem isso, acessar
   qualquer rota do React Router direto (recarregar a página, abrir link) dá 404
   na Vercel. Já está configurado:
   `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`.
8. **Sempre commitar logo depois que o usuário confirma que testou com
   sucesso** — já aconteceu de 3 rodadas de mudança ficarem sem commit/push
   porque o usuário foi pedindo a próxima coisa rápido, e o deploy na Vercel saiu
   desatualizado (ela builda a partir do GitHub, não do código local).

## Funcionalidades já construídas

- **Login** (`/login`): e-mail ou telefone, redirecionamento reativo (sem
  `navigate()` imperativo, evita corrida com o `AuthContext`).
- **Layout**: `Header` responsivo (menu vira gaveta/Sheet no mobile — editores
  publicam principalmente pelo celular), `Footer`, ambos com a identidade visual
  (logo `logo-corre.png` no cabeçalho/login, `logo-jtfh.png` no rodapé).
- **Categorias** (`/admin/categorias`, só admin): CRUD completo, ícone e cor de
  listas curadas.
- **Publicações** (`/admin/publicacoes`, admin+editor): CRUD completo — imagem de
  capa (upload + redimensionamento client-side antes de enviar), editor de texto
  restrito (Tiptap: parágrafo, negrito, itálico, listas, citação, link — sem
  fonte/cor livre), anexos, tags, destaque, status, duplicar, filtros/busca, e o
  sistema de **atualizações** (com imagem opcional, editar/excluir individual).
- **Home pública** (`/`, atrás de login): busca, filtro por categoria, seção de
  destaques, últimas publicações (só status `published` aparece).
- **Página de publicação** (`/publicacoes/:id`): conteúdo completo, anexos,
  atualizações, publicações relacionadas (mesma categoria).
- **Dashboard** (`/admin/dashboard`, só admin): contadores (total/publicadas/
  rascunhos/arquivadas), categorias mais usadas (barra horizontal monocromática,
  seguindo a metodologia do skill de dataviz), últimas publicações.
- **Usuários** (`/admin/usuarios`, só admin): criar (com truque da segunda
  instância do Firebase), editar nome/perfil, remover perfil (não exclui a conta
  de login, só revoga acesso — ver seção de Autenticação acima).
- **Troca de senha** (item "Trocar senha" no menu do `Header`, qualquer perfil
  logado, inclusive leitor): reautentica com a senha atual
  (`EmailAuthProvider` + `reauthenticateWithCredential`) antes de chamar
  `updatePassword` — evita o erro `auth/requires-recent-login` e serve de
  confirmação de identidade. `src/firebase/auth.ts` (`changePassword`) +
  `src/features/auth/ChangePasswordForm.tsx`.

## O que falta / próximos passos possíveis

**Decisão consciente do usuário:** não construir uma tela de "Configurações"/
"Perfil" (autoatendimento do usuário logado) — gerenciamento de conta (criar,
editar, promover) fica só com o admin, mesmo pra editor. A única necessidade
real de autoatendimento identificada era troca de senha, que já foi resolvida
acima sem precisar de uma seção inteira do painel.

Do prompt original, ainda não construído:
- Upload de **foto de perfil de verdade** (hoje avatar mostra só iniciais — foi
  decisão consciente do usuário, adiada).
- Itens de "Evolução futura" do prompt: calendário/agenda, notificações,
  comentários, galeria, vídeos, multi-tenant de verdade, exportação PDF/Excel,
  integração com Teams/WhatsApp.

Nada disso foi começado — é só o "próximo capítulo" possível quando o usuário
quiser continuar.

## Como testar/rodar

```bash
cd "C:\Projetos\ProjetoJTFH\MuralInformacoesProjetoJTFC\ProjetoJTFH"
npm install
npm run dev     # roda local, abre o navegador (server.open configurado)
npm run build   # build de produção + typecheck (rodar sempre antes de commitar)
```

Node/npm precisaram ser instalados via `winget` nessa máquina (não estavam
presentes). Se o PowerShell não reconhecer `node`/`npm` numa sessão nova, o PATH
pode não ter atualizado — usar Git Bash como alternativa, ou recarregar o PATH
a partir do registro.

## Forma de trabalhar combinada com o usuário

- **Nunca alterar código sem perguntar antes** — sempre propor e esperar
  confirmação, mesmo pra mudanças pequenas.
- Depois que o build passa e o usuário confirma que testou com sucesso,
  **perguntar se quer commitar/subir direto pra produção ou testar local
  primeiro** — não presumir nenhuma das duas.
- Rodar `npm run build` como checkpoint depois de toda mudança de código, antes
  de pedir pro usuário testar.

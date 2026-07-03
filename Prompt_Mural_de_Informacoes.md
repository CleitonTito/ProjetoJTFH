# Objetivo

Você é um arquiteto de software e desenvolvedor Full Stack Sênior
especializado em React, Firebase e aplicações escaláveis.

Sua missão é criar um sistema web completo chamado **Mural de
Informações**, destinado ao uso interno de um projeto voluntário.

O sistema deve funcionar como um pequeno CMS (Content Management
System), onde qualquer voluntário autorizado consiga publicar um
comunicado em menos de dois minutos, sem qualquer conhecimento técnico.

O usuário jamais deverá montar páginas manualmente. Toda publicação será
gerada automaticamente através de um formulário padronizado.

O principal objetivo é manter todas as publicações organizadas, com
identidade visual consistente e excelente experiência de uso.

------------------------------------------------------------------------

# Stack tecnológica

-   React
-   Vite
-   TypeScript
-   Firebase Authentication
-   Firebase Firestore
-   Firebase Storage
-   React Router
-   React Hook Form
-   Zod
-   TanStack Query
-   Material UI ou Shadcn/UI

Hospedagem: **Vercel**

Banco de dados: **Firestore**

Arquivos: **Firebase Storage**

------------------------------------------------------------------------

# Arquitetura

Construir uma arquitetura limpa, desacoplada e preparada para
crescimento.

Estrutura sugerida:

``` text
src/
  components/
  pages/
  layouts/
  features/
  services/
  firebase/
  hooks/
  contexts/
  types/
  utils/
  assets/
  styles/
```

------------------------------------------------------------------------

# Conceito principal

O sistema não é um editor de páginas.

Ele é um gerenciador de comunicados.

O administrador apenas informa os dados.

O sistema gera automaticamente:

-   Card da publicação
-   Página da publicação
-   Destaques
-   Organização
-   Layout

Nenhum usuário poderá alterar o layout das publicações.

Toda publicação deve seguir exatamente o mesmo padrão visual.

------------------------------------------------------------------------

# Fluxo de publicação

Login → Nova publicação → Preencher formulário → Publicar.

Sem HTML, Markdown ou edição de layout.

------------------------------------------------------------------------

# Campos do formulário

-   Título
-   Subtítulo (opcional)
-   Categoria
-   Resumo (máximo 250 caracteres)
-   Imagem principal
-   Conteúdo
-   Autor
-   Data
-   Publicação em destaque
-   Status (Rascunho, Publicado, Arquivado)
-   Tags
-   Anexos (opcional)

------------------------------------------------------------------------

# Conteúdo

Permitir apenas:

-   Parágrafos
-   Negrito
-   Itálico
-   Listas
-   Links
-   Citações
-   Quebra de linha

Não permitir alteração de fontes, cores ou tamanhos para preservar o
padrão visual.

------------------------------------------------------------------------

# Página inicial

Exibir:

-   Logo do projeto
-   Nome do projeto
-   Campo de pesquisa
-   Filtro por categoria
-   Publicações em destaque
-   Últimas publicações

Cada card deve conter:

-   Imagem
-   Categoria
-   Título
-   Resumo
-   Data
-   Botão "Ler mais"

------------------------------------------------------------------------

# Página da publicação

Sempre apresentar:

-   Imagem principal
-   Título
-   Subtítulo
-   Categoria
-   Data
-   Autor
-   Conteúdo
-   Anexos
-   Publicações relacionadas

------------------------------------------------------------------------

# Painel administrativo

Funcionalidades:

-   Dashboard
-   Publicações
-   Categorias
-   Usuários
-   Configurações
-   Perfil

Operações:

-   Criar
-   Editar
-   Excluir
-   Duplicar
-   Arquivar
-   Publicar
-   Salvar rascunho
-   Pesquisar
-   Filtrar
-   Ordenar

------------------------------------------------------------------------

# Dashboard

Indicadores:

-   Quantidade de publicações
-   Publicações publicadas
-   Rascunhos
-   Arquivadas
-   Últimas publicações
-   Categorias mais utilizadas

------------------------------------------------------------------------

# Categorias

Cada categoria possui:

-   Nome
-   Descrição
-   Ícone
-   Cor
-   Ordem de exibição
-   Ativa/Inativa

------------------------------------------------------------------------

# Upload de imagens

Permitir:

-   Arrastar arquivo
-   Selecionar do computador
-   Pré-visualização
-   Trocar imagem
-   Remover imagem

Redimensionar automaticamente antes do envio.

------------------------------------------------------------------------

# Pesquisa

Pesquisar por:

-   Título
-   Resumo
-   Conteúdo
-   Categoria
-   Autor
-   Tags

------------------------------------------------------------------------

# Identidade visual

O logotipo deve aparecer:

-   Tela de login
-   Cabeçalho
-   Cards
-   Rodapé

Interface limpa, moderna, neutra e responsiva.

------------------------------------------------------------------------

# Segurança

-   Firebase Authentication
-   Perfis: Administrador, Editor e Leitor
-   Regras do Firestore

------------------------------------------------------------------------

# Performance

-   Lazy Loading
-   Code Splitting
-   Compressão de imagens
-   Paginação
-   Cache
-   Consultas otimizadas

------------------------------------------------------------------------

# Boas práticas

-   SOLID
-   Clean Code
-   Componentização
-   TypeScript
-   Zod
-   Separação entre UI, regras de negócio e dados

------------------------------------------------------------------------

# Evolução futura

Preparar a arquitetura para:

-   Área de documentos
-   Calendário
-   Agenda
-   Notificações
-   Comentários
-   Galeria
-   Vídeos
-   Múltiplos projetos (multi-tenant)
-   Painel de métricas
-   Exportação para PDF
-   Exportação para Excel
-   Integração com Microsoft Teams
-   Integração com WhatsApp

------------------------------------------------------------------------

# Experiência do usuário

A publicação de um comunicado deve levar menos de dois minutos.

O sistema deve priorizar simplicidade, consistência visual e facilidade
de manutenção.

Desde a primeira versão, toda entidade principal deve possuir um
`organizationId`, permitindo que a aplicação seja multi-organização
(multi-tenant) no futuro, com isolamento de dados, identidade visual e
usuários por organização.

# Caze — Chamados

Aplicativo de chamados feito com React, TypeScript e Power Apps Code Apps. Consulta, cria e atualiza registros no Dataverse, aciona o Power Automate na criação e consulta artigos no SharePoint.

## Estrutura do código

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Controla navegação, lista compartilhada e abertura dos modais. |
| `src/pages/Dashboard/` | Página de visão geral; seus componentes locais são `KpiCard` e `GraficoChamados`. |
| `src/pages/Chamados/` | Página de listagem, com pesquisa, filtros, paginação, exportação e acesso à criação. |
| `src/pages/BaseConhecimento/` | Página de artigos do SharePoint; cards, categorias e detalhe permanecem em `components/` dentro da página. |
| `src/pages/Relatorio/` | Página que incorpora o relatório Power BI. |
| `src/components/chamados/` | Tabela, menu de ações, campos e modais de criação, detalhes, edição e exclusão reutilizados pelo aplicativo. Cada componente mantém seu CSS ao lado, quando necessário. |
| `src/components/layout/` | Estrutura comum das páginas: `Pagina`, `Header` e `Sidebar`. |
| `src/components/ui/` | Controles genéricos: `Button`, `CampoPesquisa`, `Mensagem` e `Modal`. |
| `src/hooks/` | Carregamento e operações de chamados, criação, mensagens temporárias, usuário e tema. |
| `src/services/` | Integrações do aplicativo com os serviços gerados de Dataverse, Power Automate e SharePoint. |
| `src/utils/` | Validação e opções de chamados, filtros por texto/status/prioridade/datas, ordenação, agrupamento e geração do PDF. |
| `src/types/baseConhecimento.ts` | Tipo `Artigo` compartilhado pela página, seus componentes e o serviço. Não contém dados estáticos. |
| `src/index.css` | Estilos globais, mensagens e variáveis do tema escuro. |
| `src/generated/` | Modelos e serviços gerados pelo Power Apps. Não editar manualmente. |
| `.power/` e `power.config*.json` | Esquemas e configurações da integração Power Apps. Preservar e manter pelo fluxo da CLI. |

Fluxo das operações: **página/componente → hook ou service do aplicativo → serviço gerado → fonte de dados**.

A tabela é compartilhada pelo Dashboard (cinco chamados mais recentes) e pela página Chamados (listagem completa com paginação). Por isso fica em `components/chamados`, sem dependência de uma página específica. A criação é feita em `NovoChamadoModal`, também montado pelo `App`.

A página antes implementada em `pages/NovoChamado/NovoChamado.tsx` agora se chama `pages/Chamados/Chamados.tsx`. Os identificadores internos de navegação e os textos da interface foram mantidos para preservar o comportamento e o layout.

## Comportamentos preservados

- A lista compartilhada alimenta as tabelas, os gráficos e os indicadores. O serviço percorre as páginas retornadas pelo Dataverse.
- A listagem combina pesquisa, status, prioridade e período de **data de cadastro (`createdon`)**, antes da paginação. O PDF recebe todos os resultados filtrados e inclui os critérios no cabeçalho.
- `Limpar filtros` limpa pesquisa, status, prioridade e datas, voltando à primeira página.
- O formulário valida título e descrição. A edição aceita qualquer status; a exclusão permanece restrita aos chamados abertos.
- A notificação só é acionada depois de criar o registro. Se falhar, o chamado continua criado e a interface mostra um aviso para evitar cadastro duplicado.
- O solicitante fixo `José Amorim` na criação foi mantido. O cabeçalho lê o usuário da conta pelo contexto do Power Apps.
- O tema claro/escuro é salvo em `localStorage`. A restauração inicial no HTML evita o flash claro; `useTema` mantém o botão e a preferência sincronizados. O relatório Power BI incorporado controla seu próprio conteúdo.
- A Base de Conhecimento carrega artigos do SharePoint e filtra os dados carregados por categoria e pesquisa.

Componentes exclusivos ficam na página que os utiliza. Componentes compartilhados ficam em `components`; hooks em `hooks`; integrações em `services`; funções sem dependência de React em `utils`; tipos compartilhados sem dados em `types`.

## Executar e verificar

Na pasta que contém `package.json`, com as conexões e autenticação do ambiente Power Apps configuradas:

```powershell
npm.cmd ci
npm.cmd run dev
```

`npm.cmd` evita o bloqueio de `npm.ps1` no PowerShell. Em outros terminais, pode-se usar `npm`.

```powershell
npm.cmd run build
npm.cmd run lint
```

A reorganização foi verificada com build de produção (`tsc -b && vite build`), lint e revisão dos imports e do diff. Os arquivos gerados, esquemas, configurações de conexão e versões das dependências não foram alterados.

Neste ambiente Linux, o script de instalação da dependência nativa `keytar` da CLI falhou. As dependências foram então instaladas com `npm ci --ignore-scripts --no-audit --no-fund` para executar build e lint. Isso não valida a autenticação nem a execução da CLI neste ambiente; o projeto e o lockfile não precisaram de alterações.

Para validar as integrações, use o ambiente Power Apps autenticado e registros de teste autorizados: navegue pelas quatro páginas, combine e limpe filtros, alterne/reabra o tema, abra os modais, gere o PDF e confira criação, edição, exclusão e notificações. Build e lint não substituem a conferência de Dataverse, SharePoint, Power BI e entrega real de e-mail.

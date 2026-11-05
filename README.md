# Caze — Chamados

Aplicativo de chamados feito com React, TypeScript e Power Apps Code Apps. Consulta, cria e atualiza registros no Dataverse, aciona o Power Automate na criação e consulta artigos no SharePoint.

## Estrutura do código

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Controla navegação, operações compartilhadas e abertura dos modais. |
| `src/pages/Dashboard/` | Página de visão geral; seus componentes locais são `KpiCard` e `GraficoChamados`. |
| `src/pages/Chamados/` | Página de listagem, com pesquisa, filtros, paginação, exportação e acesso à criação. |
| `src/pages/BaseConhecimento/` | Página de artigos do SharePoint; cards, categorias e detalhe permanecem em `components/` dentro da página. |
| `src/pages/Relatorio/` | Página que incorpora o relatório Power BI. |
| `src/components/chamados/` | Tabela, menu de ações, campos e modais de criação, detalhes, edição e exclusão reutilizados pelo aplicativo. Cada componente mantém seu CSS ao lado, quando necessário. |
| `src/components/layout/` | Estrutura comum das páginas: `Pagina`, `Header` e `Sidebar`. |
| `src/components/ui/` | Controles genéricos: `Button`, `CampoPesquisa`, `Mensagem` e `Modal`. |
| `src/hooks/` | Operações de chamados, consultas independentes de Dashboard/listagem, criação, mensagens temporárias, usuário e tema. |
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

- O Dashboard e a listagem fazem leituras independentes. Gravações invalidam o cache para atualizar as telas.
- A listagem combina pesquisa, status, prioridade e período de **data de abertura (`cr2cd_datadeabertura`)**, a mesma exibida na tabela, no Dataverse, antes da paginação. O PDF consulta todos os resultados filtrados somente ao ser solicitado e inclui os critérios no cabeçalho.
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
npm.cmd test
```

A reorganização foi verificada com build de produção (`tsc -b && vite build`), lint e revisão dos imports e do diff. Os arquivos gerados, esquemas, configurações de conexão e versões das dependências não foram alterados.

Neste ambiente Linux, o script de instalação da dependência nativa `keytar` da CLI falhou. As dependências foram então instaladas com `npm ci --ignore-scripts --no-audit --no-fund` para executar build e lint. Isso não valida a autenticação nem a execução da CLI neste ambiente; o projeto e o lockfile não precisaram de alterações.

Para validar as integrações, use o ambiente Power Apps autenticado e registros de teste autorizados: navegue pelas quatro páginas, combine e limpe filtros, alterne/reabra o tema, abra os modais, gere o PDF e confira criação, edição, exclusão e notificações. Build e lint não substituem a conferência de Dataverse, SharePoint, Power BI e entrega real de e-mail.

Os testes do filtro cobrem abertura diferente do cadastro, limites inclusivos, datas inválidas ou ausentes, filtros combinados e recorte da paginação. O fuso dos testes é fixado em `America/Recife` para representar os limites de dia locais.

## Otimização para cerca de 10 mil chamados

O gargalo anterior era `listarChamados`: percorria a base em lotes de 500, sem `select`. O App aguardava aproximadamente 20 consultas sequenciais antes de renderizar o Dashboard; a listagem reutilizava todos os registros e só então aplicava filtros e `slice`. Em desenvolvimento, o StrictMode podia iniciar outra cadeia de consultas; ignorar a resposta antiga não impedia o trabalho no servidor.

- `useChamados` agora coordena operações e invalidação, sem carregar a base na montagem do App. Abrir SharePoint ou Power BI não inicia uma consulta de chamados.
- `useDashboard` solicita apenas cinco chamados completos e consulta somente status/categoria em lotes de até 5 mil para calcular todos os indicadores, inclusive valores desconhecidos. As duas cargas começam em paralelo. Para 10 mil registros, a parte de indicadores cai de cerca de 20 respostas completas para duas respostas com duas colunas.
- `usePaginaChamados` busca a página selecionada, com pesquisa, status, prioridade e limites de data enviados ao Dataverse. A página padrão solicita 20 registros completos, com apenas as colunas usadas pela tabela e pelos modais.
- `$count` é usado para contagens abaixo de 5 mil. Como o resultado é limitado nesse patamar, totais maiores ou contagens ausentes são calculados percorrendo somente IDs, sem exibir 5 mil como se fosse o total. Isso preserva o total exato e a quantidade de páginas.
- A navegação sequencial usa `skipToken`. Dataverse não suporta `$skip`: saltar diretamente para uma página ainda não visitada usa um índice leve de IDs e consulta os dados completos somente dos IDs daquela página. O índice é compartilhado com a contagem quando necessário; isso ainda pode exigir leitura de todos os IDs, mas não de todos os campos.
- O SDK público usado pelo serviço gerado não expõe FetchXML/`$apply` para agregação. Por isso os gráficos ainda percorrem status/categoria no cliente, em vez de usar uma API de agregação não suportada. Agregação integral no servidor exigiria uma integração adicional, como uma Custom API ou fluxo autorizado.
- Consultas iguais compartilham a promessa em andamento e o resultado por 30 segundos. Erros saem do cache e uma gravação ou tentativa manual de recarga o invalida. A pesquisa aguarda 250 ms para reunir teclas consecutivas. Respostas antigas são ignoradas.
- O PDF continua incluindo todos os chamados filtrados; a carga maior fica restrita à exportação solicitada pelo usuário, sem baixar descrições.

As leituras usam o serviço gerado existente. Não houve alteração em `src/generated`, esquemas, conexões ou regras de edição/exclusão.

Validação: `npm test`, `npm run build`, `npm run lint` e revisão do diff. Os testes usam transporte simulado com 10 mil registros; cobrem página inicial, tokens, salto à página 500, total acima de 5 mil, deduplicação, invalidação, erros, seleção de colunas e filtros. Não houve acesso ao Dataverse autenticado para medir o tempo real: a redução de requisições e volume é verificável, mas os 10–15 segundos informados precisam ser comparados após publicar/testar no mesmo ambiente, usando a aba Network e o mesmo perfil de rede.

Referências: [opções do serviço de Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse) e [paginação OData do Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query/page-results).

# Meus chamados: implementação e apresentação

A página é `src/pages/Dashboard/Dashboard.tsx`, embora apareça como **Meus chamados** no menu. As mudanças partem da branch `organizar-chamados-comentado` e reutilizam sua arquitetura.

## Arquivos alterados e criados

| Arquivo | Situação | Por quê |
| --- | --- | --- |
| `src/pages/Dashboard/Dashboard.tsx` | Alterado | Compõe cards, filtros, tabela e paginação. Preserva o cabeçalho e os modais. |
| `src/pages/Dashboard/components/KpiCard.tsx` e `.css` | Alterados | Mesmo formato para os quatro cards, agora botões acessíveis com indicação de seleção. |
| `src/pages/Dashboard/components/ChamadosTable.tsx` e `.css` | Alterados | Sete colunas, número em destaque, nomes amigáveis, badges, data de abertura e menu de ações. A tabela recebe apenas os itens da página atual. |
| `src/pages/Dashboard/components/FiltrosChamados.tsx` e `.css` | Criados | Pesquisa e botão na primeira linha; Status, Prioridade e Categoria abaixo. Usa as opções dos utils. |
| `src/pages/Dashboard/components/MenuAcoesChamado.tsx` e `.css` | Criados | Menu `...` com Ver detalhes, Editar e Excluir. Fecha com Escape, clique fora ou saída do foco. Edição/exclusão ficam desabilitadas quando a regra não permite. |
| `src/components/ui/Paginacao.tsx` e `.css` | Criados | Anterior, números e próxima; até cinco números visíveis. Mostra a contagem filtrada. |
| `src/hooks/useFiltrosChamados.ts` | Criado | Guarda pesquisa, três filtros e página. Calcula a lista exibida e os indicadores. |
| `src/utils/chamados.ts` | Alterado | Acrescenta opções de status vindas do model, filtro combinado, recorte da página, classes dos badges e formatação da data. Preserva os recursos existentes. |
| `src/services/chamadosService.ts` | Alterado | A leitura segue `skipToken` para reunir todas as páginas retornadas pelo SDK, mantendo a ordenação existente. Criação, atualização, exclusão e notificação foram preservadas. |
| `docs/meus-chamados.md` | Criado | Explica a implementação e serve de roteiro de apresentação. |

`useChamados`, os modais, as outras páginas, `.power` e `generated` não foram alterados. As permissões e o alcance dos registros consultados continuam sendo os existentes: esta mudança não introduz um filtro por solicitante.

## Como pesquisa, filtros e paginação funcionam juntos

1. `useChamados` carrega os registros pelo service.
2. `useFiltrosChamados` guarda o estado local da pesquisa, dos filtros e da página.
3. `filtrarChamados()` aplica pesquisa **e** status **e** prioridade **e** categoria. Cada filtro vazio significa todos. A pesquisa procura no título e no número, ignorando maiúsculas e acentos.
4. `paginarChamados()` recebe o resultado filtrado e usa `slice` para mostrar até dez itens. Não filtra apenas os itens já visíveis.
5. Alterar pesquisa ou qualquer filtro volta para a página 1. Se uma exclusão reduzir o número de páginas, a página exibida é limitada à última válida.

Exemplo: pesquisar `Notebook`, selecionar `Hardware`, `Alta` e `Aberto` mostra somente os registros que atendem às quatro condições.

As opções de categoria e prioridade reutilizam `categoriasChamado` e `prioridadesChamado`. `statusChamado` também é derivado do model. Os códigos e nomes das opções não foram copiados manualmente para os selects.

Os indicadores contam todos os registros carregados, independentemente dos filtros. Clicar em Abertos, Em andamento ou Resolvidos muda o filtro de status. Total remove apenas o filtro de status; pesquisa, categoria e prioridade continuam aplicadas. Isso permite comparar o total de cada status com o resultado mais específico da pesquisa.

A data usa `cr2cd_datadeabertura`, com `createdon` como alternativa quando não existe data de abertura. Valores ausentes ou inválidos aparecem como `-`.

O menu usa `podeAlterarChamado()`. O service também verifica essa regra antes de atualizar ou excluir. Detalhes permanece disponível para qualquer status. Os modais existentes e suas mensagens de erro foram mantidos.

## Fluxo de dados

`Dashboard → useChamados → chamadosService → Cr2cd_chamadosService → Dataverse`

- **Page:** apresenta o conteúdo e decide qual modal abrir.
- **Hook de dados:** controla carregamento, erro, gravação e recarga dos registros.
- **Service:** valida dados, aplica regras e chama as operações geradas.
- **Generated Service:** usa o SDK do Power Apps para acessar o Dataverse.
- **Dataverse:** persiste os registros. Após editar ou excluir, o hook recarrega a lista.

Em paralelo, `Dashboard → useFiltrosChamados → utils` prepara a visualização no navegador. Trocar filtros e páginas não grava no Dataverse.

A criação continua seguindo `NovoChamado → useCriarChamado → criarChamado → generated → Dataverse`. Só depois da gravação o service chama `FLW_NotificarNovoChamadoService.Run(...)`. Essa integração não foi modificada.

## Correspondências conceituais com Power Apps / Power Fx

Estas são aproximações para explicar responsabilidades, não comandos intercambiáveis.

| Power Fx | Arquivo | Trecho/função real | O que faz e como comparar |
| --- | --- | --- | --- |
| `Filter` | `src/utils/chamados.ts` | `filtrarChamados()` com `chamados.filter(...)` | Cria uma lista contendo somente registros que atendem às condições. Aproxima `Filter(colChamados, ...)`, sobre uma coleção local. |
| `Sort` | `src/services/chamadosService.ts` | `listarChamados()`: `orderBy: ["createdon desc"]` | Solicita ao Dataverse os registros em ordem decrescente de criação. A aproximação mais precisa é `SortByColumns(Chamados, "createdon", SortOrder.Descending)`. Não há uma chamada JavaScript `.sort()` nesta implementação. |
| `Collect` | `src/services/chamadosService.ts` | `chamados.push(...resultado.data)` | Acrescenta os registros de cada página SDK ao array local da consulta. Lembra acrescentar registros a uma coleção. Esse array temporário não é uma coleção global nem um estado React. |
| `ClearCollect` | `src/hooks/useChamados.ts` | `setChamados(dados)` dentro de `carregar()` | Substitui a lista inteira pelos dados consultados. Lembra `ClearCollect(colChamados, ...)`. Não significa que um `Clear` e um `Collect` sejam executados literalmente. |
| `Set` — aproximação limitada | `src/App.tsx` | `setPaginaAtiva("chamados")` | Altera o estado do componente pai, compartilhado com a Sidebar por props. Lembra atribuir um valor com `Set`, mas não cria variável global. Não existe equivalente exato ao escopo global de `Set` no projeto. |
| `UpdateContext` | `src/hooks/useFiltrosChamados.ts` | `setFiltros((atuais) => ({ ...atuais, [campo]: valor }))` | Atualiza uma propriedade do estado local da listagem, preservando as outras. Lembra `UpdateContext({ filtroStatus: ... })`. O escopo React é a instância do componente que usa o hook. |
| `Patch` | `src/services/chamadosService.ts` | `atualizarChamado() → Cr2cd_chamadosService.update(id, campos)` | Atualiza título, descrição, categoria e prioridade no Dataverse, preservando os demais campos. É a responsabilidade de `Patch(Chamados, registro, {...})`. `criarChamado()` também faz a operação de criação, comparável ao uso de `Patch` com `Defaults`. |
| `Remove` | `src/services/chamadosService.ts` | `excluirChamado() → Cr2cd_chamadosService.delete(id)` | Exclui o registro no Dataverse após verificar a regra de status. Lembra `Remove(Chamados, registro)`. A confirmação continua no modal. |

## Roteiro para demonstrar ao gestor

1. Apresente os quatro indicadores e clique em um status; mostre a sincronização com o select.
2. Combine `Notebook`, `Hardware`, `Alta` e `Aberto` para demonstrar um filtro com várias condições.
3. Use mais de dez resultados para demonstrar a paginação. Mude um filtro na segunda página e mostre o retorno à primeira.
4. Mostre o número destacado, categoria legível, badges de prioridade/status e data de abertura.
5. Abra os detalhes e a edição de um chamado aberto. Explique que o formulário é um rascunho até salvar.
6. Abra o menu de um resolvido e mostre Editar/Excluir desabilitados. Explique que a regra também é verificada no service.
7. Se demonstrar gravação ou exclusão, use registros de teste; a exclusão real exige confirmação no modal.
8. Explique o caminho Page → Hook → Service → Generated → Dataverse e compare `filter`, setters, `update` e `delete` com Power Fx.

## Verificações e limites

- Compilação TypeScript/Vite e lint passaram.
- Verificação automatizada com dados simulados: pesquisa por título/número e sem acentos, três filtros combinados, reset e limites de página, exclusão na última página, nenhum resultado, indicadores independentes, nomes amigáveis, classes dos badges, datas, leitura de duas páginas SDK, ordenação solicitada, edição de campos, validação, regra de edição/exclusão e propagação de falhas de leitura/edição/exclusão.
- Não houve gravação em Dataverse real nem acionamento real do Power Automate durante essas verificações.
- A verificação visual/interação em navegador não foi executada: o navegador de testes não estava disponível e seu download falhou. Revise o visual e os modais no ambiente autenticado antes de apresentar.
- Pesquisa e paginação são locais, sobre todos os registros retornados pela consulta. Para uma base muito grande, o próximo passo seria consulta e paginação no servidor. Nenhuma mudança de arquitetura desse porte foi introduzida aqui.

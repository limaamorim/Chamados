# Do Power Apps para o Caze

Este guia descreve o código existente. As comparações ajudam a entender a intenção, mas React/TypeScript e Power Fx não funcionam exatamente da mesma forma. As alterações desta branch acrescentam comentários; não criam funcionalidades.

## Mapa para estudar

Todos os caminhos abaixo partem da raiz do projeto.

| Power Apps | Arquivo e função/componente | O que já acontece |
| --- | --- | --- |
| Filter | `src/pages/Dashboard/components/ChamadosTable.tsx` — `ChamadosTable` | `chamados.filter(...)` mantém os chamados cujo título contém a pesquisa e cujo status combina com a seleção. Filtra dados já carregados no navegador. |
| Filter | `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento`, cálculo `artigosFiltrados` | Filtra os artigos por categoria e por texto. Outro filtro evita repetir a opção fixa Todos nas categorias. |
| Filter | `src/services/baseConhecimentoService.ts` — `listarArtigos` e `obterParagrafos` | Descarta pastas/itens sem ID e remove trechos vazios do conteúdo. |
| Sort / SortByColumns | `src/services/chamadosService.ts` — `listarChamados` | `getAll({ orderBy: ["createdon desc"] })` pede ao Dataverse os mais recentes primeiro. Não existe chamada local a `sort()`. |
| UpdateContext (aproximação) | `src/pages/Dashboard/components/ChamadosTable.tsx` — `ChamadosTable` | `useState` guarda pesquisa, status e abertura do filtro; os setters alteram esses valores e atualizam a interface. |
| UpdateContext (aproximação) | `src/pages/Dashboard/Dashboard.tsx` — `Dashboard` / `abrirModal`; `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento` / `selecionarCategoria` | Guarda o modal/chamado escolhido ou a categoria/artigo selecionados. |
| UpdateContext (aproximação) | `src/pages/NovoChamado/NovoChamado.tsx` — `NovoChamado`; `src/pages/Dashboard/components/EditarChamadoModal.tsx` — `EditarChamadoModal`; `src/components/chamados/ChamadoCampos.tsx` — `ChamadoCampos` | Os dois formulários guardam um rascunho em `dados`. O componente de campos recebe `setDados` como `alterar`; mudar um campo ainda não grava no banco. |
| Set (aproximação limitada) | `src/App.tsx` — `App` | `setPaginaAtiva` muda um estado do componente pai, compartilhado com os filhos por props. Não existe variável global equivalente ao Set do Power Apps. |
| ClearCollect (aproximação) | `src/hooks/useChamados.ts` — `useChamados` / `carregar` | `setChamados(dados)` substitui toda a lista em memória pelo resultado da consulta. Não acrescenta itens à lista anterior. |
| ClearCollect (aproximação) | `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento`, dentro do `useEffect` | `setArtigos(dados)` substitui toda a lista de artigos recebida do SharePoint. |
| Patch para criar | `src/services/chamadosService.ts` — `criarChamado` | `Cr2cd_chamadosService.create(registro)` cria no Dataverse, com intenção parecida com `Patch(Fonte, Defaults(Fonte), registro)`. |
| Patch para editar | `src/services/chamadosService.ts` — `atualizarChamado` | `update(id, campos)` grava os campos alterados do chamado identificado pelo ID. |
| Remove | `src/services/chamadosService.ts` — `excluirChamado` | `delete(id)` exclui o registro no Dataverse. O hook depois consulta a lista novamente. |
| CountRows / CountRows(Filter(...)) | `src/pages/Dashboard/Dashboard.tsx` — `Dashboard` | `chamados.length` conta o total; `filter(...).length` conta cada status para os cartões. Eles não dependem do filtro visual da tabela. |
| Distinct | `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento`, cálculo `categorias` | `new Set(artigos.map(...))` remove categorias repetidas. Esse Set é uma estrutura do JavaScript, não a função Set do Power Apps. |
| FirstN | `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento`, cálculo `artigosDestaque` | `artigos.slice(0, 3)` separa até três artigos, na ordem recebida. |
| Lower, operador in, Value | `src/pages/Dashboard/components/ChamadosTable.tsx` — `ChamadosTable` | `toLowerCase()` ignora diferenças de maiúsculas; `includes()` verifica se contém o texto; `Number()` converte o status selecionado para número. |
| Lower, operador in, TrimEnds | `src/pages/BaseConhecimento/BaseConhecimento.tsx` — `BaseConhecimento`, cálculo `artigosFiltrados` | Normaliza a pesquisa e verifica se ela aparece no texto do artigo. |
| If / IsBlank / TrimEnds (intenção) | `src/utils/chamados.ts` — `validarCamposChamado` | `if`, `trim()` e `!` impedem título ou descrição vazios ou formados só por espaços. `trim()` tira espaços das pontas, como TrimEnds; não é exatamente Trim. |
| Coalesce (aproximação) | `src/utils/chamados.ts` — `criarDadosFormulario` | `??` fornece um valor padrão para `null` ou `undefined`. Ao contrário de Coalesce, preserva `""`. |
| Split / TrimEnds | `src/services/baseConhecimentoService.ts` — `obterParagrafos` | `split` divide o texto em trechos; `map` aplica `trim()` a cada trecho. |
| ResetForm (intenção) | `src/pages/NovoChamado/NovoChamado.tsx` — `NovoChamado` / `enviar` | Depois de salvar com sucesso, `setDados(criarDadosFormulario())` restaura os valores iniciais. Não é um controle Form do Power Apps. |
| Navigate (intenção) | `src/App.tsx` — `App` / `exibirPagina` | O valor de `paginaAtiva` decide qual página renderizar. Não há navegação por URL. |
| User().FullName | `src/hooks/useUsuario.ts` — `useUsuario` | `getContext()` fornece `contexto.user.fullName`, exibido no cabeçalho. O solicitante usado na criação ainda está fixo em `useCriarChamado`; são coisas diferentes. |
| Refresh (intenção) | `src/hooks/useChamados.ts` — `useChamados` / `carregar`, `recarregar`, `salvar`, `excluir` | Consulta novamente o Dataverse e substitui a lista local após edição/exclusão ou nova tentativa de carregamento. |

## O que não foi encontrado

- **Collect para acrescentar registros a uma coleção local:** não há operação que junte novos chamados/artigos à lista anterior. Ter um array em `useState` não é executar Collect. Criar um registro no banco também pode lembrar Collect sobre uma fonte, mas aqui a comparação mais direta é Patch com Defaults; não há coleção local sendo incrementada.
- **LookUp (aproximação):** `consultarChamadoAtual`, em `src/services/chamadosService.ts`, usa `get(id)` para buscar o registro atual antes de editar, excluir ou avançar o status. A tabela passa o próprio chamado clicado ao modal, como a ideia de ThisItem; os artigos também passam o objeto selecionado. Os mapas de código para nome em `utils/chamados.ts` são acessos diretos por chave, não uma pesquisa LookUp em tabela.
- **Set global:** os estados ficam em componentes/hooks. O estado do App só chega aos filhos pelas propriedades.

Os serviços em `src/generated/` oferecem operações adicionais, mas uma operação estar disponível não significa que a aplicação a utiliza. Esses arquivos são gerados pela CLI e não foram editados.

## Siga um chamado pela aplicação

1. **Listar:** `Dashboard` usa `useChamados`. O hook chama `listarChamados`, que consulta o Dataverse com ordenação. `setChamados` guarda a lista. `ChamadosTable` recebe essa lista e aplica pesquisa/status antes de desenhar as linhas.
2. **Criar:** `NovoChamado` guarda o rascunho; `ChamadoCampos` altera os campos. Ao enviar, `useCriarChamado.salvar` chama `criarChamado`. O serviço valida, cria no Dataverse e depois chama o fluxo de e-mail. Se a gravação funcionar, o formulário volta aos valores iniciais.
3. **Editar:** a linha passa o chamado para `Dashboard.abrirModal`. `EditarChamadoModal` cria um rascunho. Ao salvar, chama `useChamados.salvar`, que usa `atualizarChamado` e recarrega a lista.
4. **Excluir:** a linha abre a confirmação. `ExcluirChamadoModal` chama a função recebida do Dashboard; `useChamados.excluir` usa `excluirChamado` e depois recarrega a lista.

Pense assim: **componentes mostram e recebem cliques; hooks guardam estado e coordenam operações; services conversam com as fontes; utils guardam regras e transformações reutilizadas.** Não é necessário mover uma função para outro arquivo só porque ela lembra uma função do Power Apps.

## Cuidados para explicar corretamente

- `filter()` devolve uma nova lista; não apaga registros da fonte.
- `map()` transforma cada item. Quando devolve JSX, desenha uma linha/card por item, semelhante à apresentação de uma Gallery. Não é automaticamente Collect nem ForAll com gravação.
- `useEffect` executa efeitos após a renderização. Os efeitos de carregamento lembram a intenção de carregar dados ao abrir a tela, mas não são equivalentes exatos a OnVisible.
- `useState` guarda valores que afetam a interface. `useRef` guarda controles internos, como impedir envio duplicado, e não atualiza a interface ao mudar.
- `useMemo` reaproveita um cálculo conforme suas dependências; não consulta nem grava dados sozinho.
- Os filtros locais só trabalham sobre os registros que o serviço devolveu; não representam automaticamente filtros delegados à fonte.

## Painel de atendimento: etapas do chamado

A página e o menu agora usam **Gerenciar chamados**. A tabela mostra solicitante,
data de abertura (com `createdon` como alternativa), prioridade com etiquetas e um
seletor de status sempre visível. Os ícones SVG ficam no componente simples `Icone.tsx`.

- **Aberto:** visualizar, editar, excluir com confirmação e iniciar atendimento.
- **Em andamento:** visualizar e resolver chamado.
- **Resolvido:** visualizar.

O caminho do clique é `ChamadosTable` → `Dashboard` → `useChamados.avancarStatus`
→ `avancarStatusChamado` → serviço gerado do Dataverse. `obterProximoStatus`, em
`utils/chamados.ts`, define a próxima etapa. O `update` equivale à ideia de
`Patch`: envia somente `cr2cd_status`. Depois, a lista é consultada novamente
(ideia de `Refresh` + `ClearCollect`), atualizando também os indicadores.

O serviço consulta o status atual antes de editar, excluir ou avançar a etapa.
Se o status já tiver mudado, a operação incompatível é bloqueada. Essa consulta
não é uma atualização atômica: regras contra alterações simultâneas e permissões
por perfil devem ser garantidas no Dataverse. O painel não cria um perfil de
segurança de administrador; a identificação no cabeçalho é apenas visual.

Para validar no Power Apps, use registros de teste: inicie um aberto, confirme
que edição/exclusão desaparecem, resolva o chamado e confira o filtro e os cartões.
Também confira edição e exclusão de outro chamado aberto e falhas de permissão.

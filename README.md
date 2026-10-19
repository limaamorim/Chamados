# Caze — Chamados

Aplicativo de chamados feito com React, TypeScript e Power Apps Code Apps. Os registros são salvos no Dataverse e a criação aciona um fluxo do Power Automate para notificação.

## Como o código está organizado

| Pasta/arquivo                               | Responsabilidade                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/`                                | As quatro páginas montam suas telas usando a estrutura compartilhada `Pagina`.                                                                               |
| `src/pages/Dashboard/components/`           | Tabela, indicadores e modais exclusivos do Dashboard.                                                                                                        |
| `src/pages/BaseConhecimento/components/`    | Cards de artigos/categorias e detalhe do artigo, usados somente nesta página.                                                                                |
| `src/components/ui/`                        | Elementos genéricos: `Button`, `Modal`, `Mensagem`, `Pagina`, `Header`, `CampoPesquisa` e `Sidebar`.                                                         |
| `src/components/chamados/ChamadoCampos.tsx` | Campos de título, descrição, categoria e prioridade compartilhados entre criação e edição. É um componente do domínio de chamados, não um controle genérico. |
| `src/hooks/useChamados.ts`                  | Busca e atualização da lista, operações de edição/exclusão e estados dessas operações.                                                                       |
| `src/hooks/useCriarChamado.ts`              | Processamento da criação e mensagens de erro, sucesso ou falha na notificação.                                                                               |
| `src/hooks/useMensagemTemporaria.ts`        | Temporizador de mensagens compartilhado pelo Dashboard e pela criação.                                                                                       |
| `src/hooks/useUsuario.ts`                   | Leitura do nome do usuário no contexto do Power Apps para o Header.                                                                                          |
| `src/services/chamadosService.ts`           | Operações e integrações com Dataverse e Power Automate.                                                                                                      |
| `src/utils/chamados.ts`                     | Opções dos formulários, nomes, validações e criação de rascunhos. Não usa React nem acessa o banco.                                                          |
| `src/data/baseConhecimento.ts`              | Conteúdo estático e tipo `Artigo`, sem depender de um componente visual.                                                                                     |
| `src/generated/`                            | Modelos e serviços gerados pelo Power Apps. Não editar manualmente.                                                                                          |
| `src/App.tsx`                               | Controla a navegação e passa a página ativa para a Sidebar.                                                                                                  |
| `src/index.css`                             | Estilos globais e mensagens de sucesso, erro e aviso.                                                                                                        |
| `.power/` e `power.config.json`             | Esquemas e configurações da integração com Power Apps.                                                                                                       |

Fluxo das operações: **página → hook → service do aplicativo → serviço gerado → Dataverse**. Os componentes de interface não conhecem o conector.

## Responsabilidades das quatro páginas

- **Dashboard:** compõe indicadores/tabela e escolhe o modal ativo. Os dados e operações ficam em `useChamados`; o rascunho de edição pertence ao modal. Falhas de edição/exclusão aparecem no modal. Uma falha de leitura permite tentar novamente.
- **Novo chamado:** mantém os valores do formulário. `useCriarChamado` controla a gravação, e `ChamadoCampos` compartilha os campos com a edição. O formulário é limpo apenas se o registro tiver sido criado.
- **Base de conhecimento:** mantém os estados de busca, categoria e artigo aberto. A filtragem é pequena e acompanha a interface, portanto permanece na página. O artigo completo é apresentado por `ArtigoDetalhe`.
- **Relatório:** apresenta o iframe do Power BI. Não precisa de um hook ou service para apenas exibir uma URL.

Os componentes específicos ficam perto da página que os utiliza, com seu CSS. `Pagina` centraliza cabeçalho, mensagens e espaçamentos; não é necessário repetir a estrutura nas telas. O `Modal` usa o elemento nativo `dialog` para foco e teclado e bloqueia fechamento enquanto uma operação estiver em andamento. Seu conteúdo e ações continuam nos modais específicos.

Não foram criados componentes de loading, badge ou empty state: os usos atuais não justificam uma abstração própria. Também não há uma biblioteca global de estado nem um hook genérico de formulário.

## Ordem das partes de uma página

1. Imports e tipos das propriedades.
2. Estados locais da interface e hooks das operações.
3. Cálculos simples e funções dos eventos.
4. Interface, usando `Pagina` e componentes específicos quando necessário.

Os comentários no código explicam as responsabilidades, os rascunhos de formulário e o tratamento das integrações.

## Relação com fórmulas do Power Apps

As correspondências abaixo são de comportamento, não funções idênticas.

| Power Fx                 | React/Code Apps                                           | Onde observar                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Filter`                 | `array.filter(...)`                                       | Pesquisa de títulos em `ChamadosTable.tsx`, filtro de artigos e contagem de status no Dashboard. Atua nos dados já carregados.                                                          |
| `Sort` / `SortByColumns` | `orderBy: ["createdon desc"]`                             | `listarChamados`, no service, pede ao Dataverse os mais recentes primeiro. JavaScript também permite ordenar arrays locais.                                                             |
| `Collect`                | Acrescentar um item ao array de estado                    | Exemplo de estudo: `setChamados(listaAtual => [...listaAtual, novoChamado])`. Isso muda só a memória; não salva no banco. Não foi acrescentado um botão de coleção local ao aplicativo. |
| `ClearCollect`           | Substituir a lista carregada                              | `setChamados(dados)`, em `useChamados`, substitui o array inteiro. É uma aproximação de comportamento.                                                                                  |
| `Set`                    | Setter do `useState`, respeitando o alcance do componente | `setPaginaAtiva` está no `App` e é passado à Sidebar. Não é uma variável global automática.                                                                                             |
| `UpdateContext`          | Atualizar um estado local                                 | `setSalvando` e `setErro` nos hooks, além do modal ativo no Dashboard.                                                                                                                  |

Para gravar no Dataverse, o aplicativo usa `Cr2cd_chamadosService.create`. Uma coleção local e um registro persistido são coisas diferentes.

## Criar, editar e excluir

- **Criar:** a página chama o hook, que aciona `criarChamado`. O service valida os campos, monta as colunas, verifica a gravação e só depois chama o fluxo.
- **Notificar:** se a notificação falhar depois da gravação, a tela informa que o chamado foi criado, mas a notificação falhou. Não é necessário criar o mesmo chamado novamente. O retorno de sucesso do acionamento do fluxo não garante a entrega final do e-mail.
- **Editar/excluir:** o service verifica se o status é aberto. Após sucesso, `useChamados` consulta a lista novamente.
- **Opções dos formulários:** vêm dos mapas gerados e são compartilhadas entre criação e edição.
- O nome fixo `José Amorim` foi mantido na criação como no protótipo original. O Header continua lendo o usuário da conta; integrar esse usuário à gravação é uma melhoria separada.
- A listagem mantém a consulta original, sem um filtro explícito por solicitante.

## Rodar no Windows / PowerShell

Execute dentro da pasta que contém `package.json`:

```powershell
npm.cmd install
npm.cmd run dev
```

`npm.cmd` é usado quando o PowerShell bloqueia o script `npm.ps1`. O desenvolvimento depende da configuração e autenticação do ambiente Power Apps.

Para verificar compilação e regras de código:

```powershell
npm.cmd run build
npm.cmd run lint
```

## Roteiro de testes no ambiente Power Apps

Use registros de teste autorizados para validar as operações no Dataverse.

| Teste                                        | Resultado esperado                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Pesquisar parte de um título e depois limpar | Filtra os chamados carregados e volta à lista completa.                                                  |
| Comparar registros com datas diferentes      | Mais recente primeiro.                                                                                   |
| Criar com título ou descrição em branco      | Mostra validação e não cria registro.                                                                    |
| Criar preenchendo todos os campos            | Cria um registro, limpa os campos e aciona o fluxo. Conferir o histórico do fluxo e a chegada do e-mail. |
| Falha de gravação                            | Mostra erro, preserva o formulário e não chama o fluxo.                                                  |
| Falha da notificação após gravar             | Mostra sucesso da criação e aviso da notificação, sem recriar o registro.                                |
| Abrir edição                                 | Lista todas as categorias e prioridades.                                                                 |
| Editar um chamado aberto                     | Persiste as alterações e atualiza a listagem.                                                            |
| Editar com campos vazios                     | Exibe a validação no modal e mantém a tabela.                                                            |
| Excluir um registro de teste aberto          | Após confirmação, remove o registro e atualiza a lista.                                                  |
| Ver chamado em andamento ou resolvido        | Não oferece botões de editar/excluir.                                                                    |
| Navegar pela Sidebar                         | Mostra a página selecionada.                                                                             |
| Sair de uma página com mensagem temporária   | Cancela o temporizador da mensagem.                                                                      |
| Abrir as páginas em tela estreita            | Mantém espaçamentos e cabeçalhos padronizados.                                                           |

Para testar falhas de integração, use simulação controlada ou um ambiente de testes. Não desconecte recursos de produção para provocar erros.

## Verificações desta organização

- Compilação (`npm run build`), lint (`npm run lint`) e integridade do diff executados.
- Testes de componentes em React StrictMode com conta e integrações simuladas: navegação nas quatro páginas, filtro de títulos, opções de categoria/prioridade, validação, edição/exclusão, cancelamento, criação e falhas, aviso de notificação, detalhes, artigos e recuperação de busca.
- O evento de cancelamento do modal foi testado com uma implementação simulada de `dialog` no JSDOM. Foco, Escape nativo e layout precisam de conferência em navegador real; a instalação do navegador automatizado não ficou disponível neste ambiente.
- Dataverse, histórico do fluxo, autenticação do Power BI e entrega real de e-mail precisam do teste no ambiente autenticado. Os testes simulados não gravaram registros nem enviaram e-mails.

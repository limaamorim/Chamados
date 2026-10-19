# Caze — Chamados

Aplicativo de chamados feito com React, TypeScript e Power Apps Code Apps. Os registros são salvos no Dataverse e a criação aciona um fluxo do Power Automate para notificação.

## Como o código está organizado

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/pages/` | Monta as telas e controla seus campos, mensagens e modais. |
| `src/components/` | Contém a tabela, os modais, os cards, o Header e a Sidebar. |
| `src/services/chamadosService.ts` | Busca, cria, atualiza e exclui registros usando os serviços gerados. Na criação, também aciona a notificação. |
| `src/utils/chamados.ts` | Compartilha nomes de categorias/status/prioridades, opções dos selects e validações. Não usa React nem acessa o banco. |
| `src/generated/` | Modelos e serviços gerados pelo Power Apps. Não editar manualmente. |
| `src/data/Data.ts` | Artigos e categorias locais da base de conhecimento. |
| `src/App.tsx` | Controla qual página aparece e compartilha essa escolha com a Sidebar. |
| `src/index.css` | Estilos globais e mensagens de sucesso, erro e aviso. |
| `.power/` e `power.config.json` | Esquemas e configurações da integração com Power Apps. |

Fluxo de uma operação: **página → service do aplicativo → serviço gerado → Dataverse**. As funções de `utils` ajudam a página e o service com regras e valores compartilhados.

Os estados continuam nas páginas para facilitar o aprendizado. Não há hooks personalizados nem novas bibliotecas de estado.

## Ordem das partes de uma página

1. Imports e tipos das propriedades.
2. Estados (`useState`): valores que podem mudar e atualizar a interface.
3. Efeitos (`useEffect`), quando necessários: carregamento inicial ou temporizadores com limpeza.
4. Funções chamadas pelos botões.
5. Interface (`return`) e exportação.

## Relação com fórmulas do Power Apps

As correspondências abaixo são de comportamento, não funções idênticas.

| Power Fx | React/Code Apps | Onde observar |
| --- | --- | --- |
| `Filter` | `array.filter(...)` | Pesquisa de títulos em `ChamadosTable.tsx`, filtro de artigos e contagem de status no Dashboard. Atua nos dados já carregados. |
| `Sort` / `SortByColumns` | `orderBy: ["createdon desc"]` | `listarChamados` pede ao Dataverse os mais recentes primeiro. JavaScript também permite ordenar arrays locais. |
| `Collect` | Acrescentar um item ao array de estado | Exemplo de estudo: `setChamados(listaAtual => [...listaAtual, novoChamado])`. Isso muda só a memória; não salva no banco. Não foi acrescentado um botão de coleção local ao aplicativo. |
| `ClearCollect` | Substituir a lista carregada | `setChamados(dados)` substitui o array inteiro. É uma aproximação de comportamento. |
| `Set` | Setter do `useState`, respeitando o alcance do componente | `setPaginaAtiva` está no `App` e é passado à Sidebar. Não é uma variável global automática. |
| `UpdateContext` | Atualizar um estado local | `setSalvando`, `setErro` e os estados dos modais. |

Para gravar no Dataverse, o aplicativo usa `Cr2cd_chamadosService.create`. Uma coleção local e um registro persistido são coisas diferentes.

## Criar, editar e excluir

- **Criar:** a página valida os campos e chama `criarChamado`. O service monta as colunas, verifica a gravação e só depois chama o fluxo.
- **Notificar:** se a notificação falhar depois da gravação, a tela informa que o chamado foi criado, mas a notificação falhou. Não é necessário criar o mesmo chamado novamente. O retorno de sucesso do acionamento do fluxo não garante a entrega final do e-mail.
- **Editar/excluir:** o service verifica se o status é aberto. Após sucesso, o Dashboard consulta a lista novamente.
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

| Teste | Resultado esperado |
| --- | --- |
| Pesquisar parte de um título e depois limpar | Filtra os chamados carregados e volta à lista completa. |
| Comparar registros com datas diferentes | Mais recente primeiro. |
| Criar com título ou descrição em branco | Mostra validação e não cria registro. |
| Criar preenchendo todos os campos | Cria um registro, limpa os campos e aciona o fluxo. Conferir o histórico do fluxo e a chegada do e-mail. |
| Falha de gravação | Mostra erro, preserva o formulário e não chama o fluxo. |
| Falha da notificação após gravar | Mostra sucesso da criação e aviso da notificação, sem recriar o registro. |
| Abrir edição | Lista todas as categorias e prioridades. |
| Editar um chamado aberto | Persiste as alterações e atualiza a listagem. |
| Editar com campos vazios | Exibe a validação no modal e mantém a tabela. |
| Excluir um registro de teste aberto | Após confirmação, remove o registro e atualiza a lista. |
| Ver chamado em andamento ou resolvido | Não oferece botões de editar/excluir. |
| Navegar pela Sidebar | Mostra a página selecionada. |
| Sair de uma página com mensagem temporária | Cancela o temporizador da mensagem. |
| Abrir as páginas em tela estreita | Mantém espaçamentos e cabeçalhos padronizados. |

Para testar falhas de integração, use simulação controlada ou um ambiente de testes. Não desconecte recursos de produção para provocar erros.

## Verificações desta organização

- Compilação (`npm run build`) e lint (`npm run lint`) executados com sucesso.
- Funções do service e de utils verificadas com integrações simuladas: opções, validação, ordenação, gravação antes da notificação, falha de criação sem acionar o fluxo, falha parcial de notificação e restrições de edição/exclusão.
- Dataverse, histórico do fluxo e entrega real de e-mail ainda precisam do teste no ambiente autenticado. Os testes simulados não gravaram registros nem enviaram e-mails.

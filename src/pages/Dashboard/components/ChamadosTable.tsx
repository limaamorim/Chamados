// Permite guardar informações que mudam na interface.
// Aqui: pesquisa, status selecionado e abertura do filtro.
import { useState } from "react";

// Funções auxiliares que já existem em outro arquivo.
import {
    obterStatus,        // Obtém o nome do status do chamado.
    obterCategoria,     // Obtém o nome da categoria.
    obterPrioridade,    // Obtém o nome da prioridade.
    podeAlterarChamado, // Verifica se o chamado pode ser editado/excluído.
} from "../../../utils/chamados";

// Importa o mapa de códigos e nomes dos status.
// É usado para montar as opções do filtro e mostrar o nome selecionado.
import { Cr2cd_chamadoscr2cd_status } from "../../../generated/models/Cr2cd_chamadosModel";

// Importa somente o tipo do chamado.
// Ajuda o TypeScript a conferir os campos utilizados.
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";

// Componente reutilizável do campo de pesquisa.
import CampoPesquisa from "../../../components/ui/CampoPesquisa";

// Componente reutilizável de botão.
import Button from "../../../components/ui/Button";

// Estilos da tabela e dos seus controles.
import "./ChamadosTable.css";


// Define os dados e funções que este componente precisa receber.
type ChamadosTableProps = {

    // Uma lista de chamados.
    // [] depois do tipo significa "lista desse tipo".
    chamados: Cr2cd_chamados[];

    // Função para abrir a página de novo chamado.
    abrirNovoChamado: () => void;

    // As três funções abaixo recebem o chamado selecionado.
    // O Dashboard fornece essas funções.
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};


// Cria o componente e retira das propriedades recebidas
// os valores e funções que serão usados.
function ChamadosTable({
    chamados,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {

    // Guarda o texto digitado na pesquisa.
    // Começa vazio.
    const [pesquisa, setPesquisa] = useState("");

    // Guarda o status escolhido no filtro.
    // "todos" significa que nenhum status específico foi escolhido.
    const [statusSelecionado, setStatusSelecionado] = useState("todos");

    // Guarda se as opções do filtro estão visíveis.
    // false: fechado.
    // true: aberto.
    const [filtroAberto, setFiltroAberto] = useState(false);


    // Cria uma lista com os chamados que passam nas DUAS condições:
    // 1. O título contém a pesquisa.
    // 2. O status corresponde ao filtro, ou o filtro está em "todos".
    const chamadosFiltrados = chamados.filter((chamado) =>

        // Pega o título.
        // Se estiver ausente, utiliza um texto vazio.
        (chamado.cr2cd_titulo ?? "")

            // Converte o título para minúsculas.
            .toLowerCase()

            // Verifica se o título contém o texto pesquisado.
            // A pesquisa também é convertida para minúsculas.
            .includes(pesquisa.toLowerCase()) &&

        // Se estiver em "todos", qualquer status passa.
        // Caso contrário, compara o status do chamado
        // com o código selecionado, convertido para número.
        (statusSelecionado === "todos" ||
            chamado.cr2cd_status === Number(statusSelecionado))
    );


    // Define o conteúdo visual do componente.
    return (

        // Fragmento: agrupa os elementos sem criar uma div adicional.
        <>
            {/* Barra com pesquisa, filtro e botão de novo chamado. */}
            <div className="barra-acoes">

                {/* Entrega o texto atual e a função para atualizá-lo.
                    Ao digitar, o campo chama setPesquisa. */}
                <CampoPesquisa
                    valor={pesquisa}
                    aoAlterar={setPesquisa}
                    placeholder="Pesquisar chamados..."
                />

                <div className="filtro-status">

                    {/* Botão que abre ou fecha as opções do filtro.
                        aria-expanded informa se está aberto.
                        aria-controls identifica o elemento controlado.
                        Esses atributos ajudam na acessibilidade. */}
                    <Button
                        variante="secundario"
                        aria-expanded={filtroAberto}
                        aria-controls="filtro-status-opcoes"
                        onClick={() => setFiltroAberto(!filtroAberto)}
                    >
                        {/*
                            Se estiver em "todos":
                            mostra "Filtrar status".

                            Caso contrário:
                            procura o nome do status pelo código
                            e mostra, por exemplo, "Status: Aberto".
                        */}
                        {statusSelecionado === "todos"
                            ? "Filtrar status"
                            : `Status: ${Cr2cd_chamadoscr2cd_status[
                                Number(statusSelecionado) as Cr2cd_chamadoscr2cd_status
                            ]}`}
                    </Button>

                    {/* Só mostra estas opções quando filtroAberto é true. */}
                    {filtroAberto && (
                        <div
                            className="filtro-status-opcoes"
                            id="filtro-status-opcoes"
                        >
                            {/* htmlFor liga o texto ao select pelo ID. */}
                            <label htmlFor="status-chamados">
                                Status do chamado
                            </label>

                            {/* Lista de seleção controlada pelo estado.
                                Ao escolher uma opção:
                                1. Guarda o valor escolhido.
                                2. Fecha as opções do filtro. */}
                            <select
                                id="status-chamados"
                                value={statusSelecionado}
                                onChange={(event) => {
                                    setStatusSelecionado(event.target.value);
                                    setFiltroAberto(false);
                                }}
                            >
                                {/* Opção que permite mostrar qualquer status. */}
                                <option value="todos">
                                    Todos os status
                                </option>

                                {/*
                                    Object.entries transforma o mapa de status
                                    em pares de código e nome.

                                    .map cria uma opção para cada par.

                                    key: identifica a opção para o React.
                                    value: valor guardado ao selecionar.
                                    nome: texto que a pessoa vê.
                                */}
                                {Object.entries(Cr2cd_chamadoscr2cd_status)
                                    .map(([codigo, nome]) => (
                                        <option key={codigo} value={codigo}>
                                            {nome}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Ao clicar, executa a função recebida do Dashboard. */}
                <Button onClick={abrirNovoChamado} icone="+">
                    Novo chamado
                </Button>
            </div>


            {/* Container utilizado para organizar e estilizar a tabela. */}
            <div className="tabela-container">

                <table className="tabela-chamados">

                    {/* Cabeçalho da tabela. */}
                    <thead>
                        {/* tr representa uma linha. */}
                        <tr>
                            {/* th representa uma célula de cabeçalho. */}
                            <th>Número</th>
                            <th>Título</th>
                            <th>Categoria</th>
                            <th>Prioridade</th>
                            <th>Status</th>

                            {/* Coluna reservada aos botões de ação. */}
                            <th></th>
                        </tr>
                    </thead>

                    {/* Corpo da tabela: linhas com os chamados. */}
                    <tbody>

                        {/* Percorre somente os chamados filtrados.
                            Para cada chamado, cria uma linha da tabela. */}
                        {chamadosFiltrados.map((chamado) => {

                            // Obtém os textos para exibição.
                            // As funções centralizam a conversão
                            // dos códigos para nomes.
                            const status = obterStatus(chamado);
                            const categoria = obterCategoria(chamado);
                            const prioridade = obterPrioridade(chamado);

                            // Devolve a linha deste chamado.
                            return (

                                // O ID identifica esta linha para o React.
                                <tr key={chamado.cr2cd_chamadoid}>

                                    {/* td representa uma célula comum.
                                        Junta o texto "CH-" ao número. */}
                                    <td className="numero-chamado">
                                        CH-{chamado.cr2cd_numero}
                                    </td>

                                    {/* Mostra o título.
                                        Se estiver ausente, mostra "-". */}
                                    <td>{chamado.cr2cd_titulo ?? "-"}</td>

                                    {/* Mostra os nomes obtidos acima. */}
                                    <td>{categoria}</td>
                                    <td>{prioridade}</td>

                                    <td>
                                        {/*
                                            Cria uma classe CSS a partir do status.

                                            Exemplo:
                                            "Em andamento"
                                            vira "em-andamento".

                                            Resultado das classes:
                                            "status status-em-andamento"
                                        */}
                                        <span
                                            className={`status status-${status
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {status}
                                        </span>
                                    </td>

                                    {/* Célula com os botões de ação. */}
                                    <td>
                                        <div className="acoes-chamado">

                                            {/* Ao clicar, entrega este chamado
                                                à função visualizarChamado.

                                                title fornece um texto de ajuda,
                                                geralmente visto ao passar o mouse. */}
                                            <button
                                                className="botao-acao botao-visualizar"
                                                onClick={() =>
                                                    visualizarChamado(chamado)
                                                }
                                                title="Visualizar chamado"
                                            >
                                                →
                                            </button>

                                            {/* Só mostra editar e excluir
                                                se a regra permitir alterar
                                                este chamado. */}
                                            {podeAlterarChamado(chamado) && (

                                                // Agrupa os dois botões.
                                                <>
                                                    {/* Avisa ao Dashboard
                                                        qual chamado editar. */}
                                                    <button
                                                        className="botao-acao botao-editar"
                                                        onClick={() =>
                                                            editarChamado(chamado)
                                                        }
                                                        title="Editar chamado"
                                                    >
                                                        ✎
                                                    </button>

                                                    {/* Avisa ao Dashboard
                                                        qual chamado foi escolhido
                                                        para a exclusão.

                                                        No fluxo mostrado antes,
                                                        isso abre a confirmação. */}
                                                    <button
                                                        className="botao-acao botao-excluir"
                                                        onClick={() =>
                                                            excluirChamado(chamado)
                                                        }
                                                        title="Excluir chamado"
                                                    >
                                                        🗑
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Se nenhum chamado passou pelo filtro,
                            mostra uma linha com a mensagem abaixo. */}
                        {chamadosFiltrados.length === 0 && (
                            <tr>

                                {/* Faz a célula ocupar as seis colunas. */}
                                <td colSpan={6} className="tabela-vazia">
                                    Nenhum chamado encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// Permite importar este componente em outro arquivo,
// como é feito no Dashboard.
export default ChamadosTable;
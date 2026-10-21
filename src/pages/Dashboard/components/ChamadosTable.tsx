import { useState } from "react";
import {
    obterStatus,
    obterCategoria,
    obterPrioridade,
    podeAlterarChamado,
} from "../../../utils/chamados";

import { Cr2cd_chamadoscr2cd_status } from "../../../generated/models/Cr2cd_chamadosModel";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import CampoPesquisa from "../../../components/ui/CampoPesquisa";
import Button from "../../../components/ui/Button";

import "./ChamadosTable.css";

type ChamadosTableProps = {
    chamados: Cr2cd_chamados[];

    abrirNovoChamado: () => void;
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

function ChamadosTable({
    chamados,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {
    // useState guarda um valor; o setter muda esse valor e atualiza a interface.
    // Lembra UpdateContext: pesquisa, status e abertura do filtro pertencem a este componente.
    const [pesquisa, setPesquisa] = useState("");

    const [statusSelecionado, setStatusSelecionado] = useState("todos");
    const [filtroAberto, setFiltroAberto] = useState(false);

    // filter() → Filter: mantém cada chamado somente se as duas condições forem verdadeiras.
    // ?? evita erro quando o título está ausente; toLowerCase() → Lower.
    // includes() verifica se o título contém a pesquisa (ideia do operador in do Power Apps).
    // && → And: texto E status precisam combinar. || → Or: "todos" OU o status escolhido.
    // Number() → Value: converte o texto do select para comparar com o código numérico.
    // O filtro atua na lista local; não consulta nem exclui registros no Dataverse.
    const chamadosFiltrados = chamados.filter((chamado) =>
        (chamado.cr2cd_titulo ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase()) &&
        (statusSelecionado === "todos" || chamado.cr2cd_status === Number(statusSelecionado))
    );

    return (
        <>
            <div className="barra-acoes">
                <CampoPesquisa
                    valor={pesquisa}
                    aoAlterar={setPesquisa}
                    placeholder="Pesquisar chamados..."
                />

                <div className="filtro-status">
                    <Button
                        variante="secundario"
                        aria-expanded={filtroAberto}
                        aria-controls="filtro-status-opcoes"
                        onClick={() => setFiltroAberto(!filtroAberto)}
                    >
                        {statusSelecionado === "todos" ? "Filtrar status" : `Status: ${Cr2cd_chamadoscr2cd_status[Number(statusSelecionado) as Cr2cd_chamadoscr2cd_status]}`}
                    </Button>
                    {filtroAberto && (
                        <div className="filtro-status-opcoes" id="filtro-status-opcoes">
                            <label htmlFor="status-chamados">Status do chamado</label>
                            <select
                                id="status-chamados"
                                value={statusSelecionado}
                                onChange={(event) => {
                                    setStatusSelecionado(event.target.value);
                                    setFiltroAberto(false);
                                }}
                            >
                                <option value="todos">Todos os status</option>
                                {Object.entries(Cr2cd_chamadoscr2cd_status).map(([codigo, nome]) => (
                                    <option key={codigo} value={codigo}>{nome}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <Button onClick={abrirNovoChamado} icone="+">
                    Novo chamado
                </Button>
            </div>

            <div className="tabela-container">
                <table className="tabela-chamados">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Título</th>
                            <th>Categoria</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {chamadosFiltrados.map((chamado) => {
                            const status = obterStatus(chamado);
                            const categoria = obterCategoria(chamado);
                            const prioridade = obterPrioridade(chamado);

                            return (
                                <tr key={chamado.cr2cd_chamadoid}>
                                    <td className="numero-chamado">
                                        CH-{chamado.cr2cd_numero}
                                    </td>

                                    <td>{chamado.cr2cd_titulo ?? "-"}</td>

                                    <td>{categoria}</td>
                                    <td>{prioridade}</td>

                                    <td>
                                        <span
                                            className={`status status-${status
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="acoes-chamado">
                                            <button
                                                className="botao-acao botao-visualizar"
                                                onClick={() =>
                                                    visualizarChamado(chamado)
                                                }
                                                title="Visualizar chamado"
                                            >
                                                →
                                            </button>

                                            {podeAlterarChamado(chamado) && (
                                                <>
                                                    <button
                                                        className="botao-acao botao-editar"
                                                        onClick={() =>
                                                            editarChamado(
                                                                chamado
                                                            )
                                                        }
                                                        title="Editar chamado"
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        className="botao-acao botao-excluir"
                                                        onClick={() =>
                                                            excluirChamado(
                                                                chamado
                                                            )
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

                        {chamadosFiltrados.length === 0 && (
                            <tr>
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

export default ChamadosTable;

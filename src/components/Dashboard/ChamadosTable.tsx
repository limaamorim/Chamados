
import { useState } from "react";

import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import CampoPesquisa from "../../components/ui/CampoPesquisa";
import BotaoNovoChamado from "../../components/ui/BotaoNovoChamado";

import "./ChamadosTable.css";

type ChamadosTableProps = {
    chamados: Cr2cd_chamados[];

    obterStatus: (chamado: Cr2cd_chamados) => string;
    obterCategoria: (chamado: Cr2cd_chamados) => string;
    obterPrioridade: (chamado: Cr2cd_chamados) => string;

    abrirNovoChamado: () => void;
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

function ChamadosTable({
    chamados,
    obterStatus,
    obterCategoria,
    obterPrioridade,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {
    const [pesquisa, setPesquisa] = useState("");

    const chamadosFiltrados = chamados.filter((chamado) =>
        (chamado.cr2cd_titulo ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
    );

    return (
        <>
            <div className="barra-acoes">
                <CampoPesquisa
                    valor={pesquisa}
                    aoAlterar={setPesquisa}
                    placeholder="Pesquisar chamados..."
                />

                <BotaoNovoChamado
                    aoClicar={abrirNovoChamado}
                />
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

                                    <td>
                                        {chamado.cr2cd_titulo ?? "-"}
                                    </td>

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

                                            {status === "Aberto" && (
                                                <>
                                                    <button
                                                        className="botao-acao botao-editar"
                                                        onClick={() =>
                                                            editarChamado(chamado)
                                                        }
                                                        title="Editar chamado"
                                                    >
                                                        ✎
                                                    </button>

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

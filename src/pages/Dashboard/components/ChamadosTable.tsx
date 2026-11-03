import { useId, useRef, useState } from "react";
import { filtrarChamados, validarPeriodoDatas } from "../../../utils/filtrosChamados";
import Mensagem from "../../../components/ui/Mensagem";
import {
    obterStatus,
    obterCategoria,
    obterPrioridade,
} from "../../../utils/chamados";

import { Cr2cd_chamadoscr2cd_status } from "../../../generated/models/Cr2cd_chamadosModel";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import CampoPesquisa from "../../../components/ui/CampoPesquisa";
import Button from "../../../components/ui/Button";
import MenuAcoesChamado from "./MenuAcoesChamado";

import "./ChamadosTable.css";

export type AcoesChamados = {
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

type ChamadosTableProps = AcoesChamados & {
    chamados: Cr2cd_chamados[];
    carregando?: boolean;
    erroCarregamento?: boolean;
    mostrarBarraAcoes?: boolean;
    abrirNovoChamado?: () => void;
};

function ChamadosTable({
    chamados,
    carregando = false,
    erroCarregamento = false,
    mostrarBarraAcoes = true,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {
    // Estado local da pesquisa: funciona como uma variável de contexto desta interface.
    const [pesquisa, setPesquisa] = useState("");

    const [statusSelecionado, setStatusSelecionado] = useState("todos");
    const [filtroAberto, setFiltroAberto] = useState(false);

    const idFiltros = useId();
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");
    const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
    const [erroRelatorio, setErroRelatorio] = useState("");
    const exportando = useRef(false);
    const erroPeriodo = validarPeriodoDatas(dataInicial, dataFinal);
    const filtros = { pesquisa, status: statusSelecionado, dataInicial, dataFinal };

    // A tabela e o PDF usam exatamente esta mesma lista filtrada.
    const chamadosFiltrados = filtrarChamados(chamados, filtros);

    async function gerarRelatorio() {
        if (exportando.current || carregando || erroCarregamento || erroPeriodo) return;
        exportando.current = true;
        setGerandoRelatorio(true);
        setErroRelatorio("");
        try {
            // A biblioteca do PDF só é carregada quando o usuário solicita o relatório.
            const { baixarRelatorioChamados } = await import("../../../utils/relatorioChamados");
            await baixarRelatorioChamados(chamadosFiltrados, filtros);
        } catch (erro) {
            console.error("Falha ao gerar relatório:", erro);
            setErroRelatorio("Não foi possível gerar o PDF. Tente novamente.");
        } finally {
            exportando.current = false;
            setGerandoRelatorio(false);
        }
    }

    return (
        <>
            {mostrarBarraAcoes && <div className="barra-acoes">
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

                {abrirNovoChamado && (
                    <Button onClick={abrirNovoChamado} icone="+">
                        Novo Chamado
                    </Button>
                )}
            </div>}

            {mostrarBarraAcoes && (
                <>
                    <div className="filtros-data-relatorio">
                        <div className="filtro-data-campo">
                            <label htmlFor={idFiltros + "-inicio"}>Data inicial</label>
                            <input
                                id={idFiltros + "-inicio"}
                                type="date"
                                value={dataInicial}
                                max={dataFinal || undefined}
                                aria-invalid={!!erroPeriodo}
                                aria-describedby={erroPeriodo ? idFiltros + "-erro" : undefined}
                                onChange={(evento) => setDataInicial(evento.target.value)}
                            />
                        </div>
                        <div className="filtro-data-campo">
                            <label htmlFor={idFiltros + "-fim"}>Data final</label>
                            <input
                                id={idFiltros + "-fim"}
                                type="date"
                                value={dataFinal}
                                min={dataInicial || undefined}
                                aria-invalid={!!erroPeriodo}
                                aria-describedby={erroPeriodo ? idFiltros + "-erro" : undefined}
                                onChange={(evento) => setDataFinal(evento.target.value)}
                            />
                        </div>
                        <Button
                            variante="secundario"
                            onClick={() => {
                                setDataInicial("");
                                setDataFinal("");
                            }}
                            disabled={!dataInicial && !dataFinal}
                        >
                            Limpar datas
                        </Button>
                        <Button
                            className="botao-gerar-relatorio"
                            variante="secundario"
                            onClick={gerarRelatorio}
                            disabled={gerandoRelatorio || carregando || erroCarregamento || !!erroPeriodo}
                        >
                            {gerandoRelatorio ? "Gerando PDF..." : "Gerar relatório"}
                        </Button>
                    </div>
                    <p className="filtros-data-resumo" role="status">
                        Período por data de cadastro · {chamadosFiltrados.length} chamado(s) encontrado(s)
                    </p>
                    {erroPeriodo && <p id={idFiltros + "-erro"} className="mensagem-erro" role="alert">{erroPeriodo}</p>}
                    <Mensagem tipo="erro">{erroRelatorio}</Mensagem>
                </>
            )}

            <div className="tabela-container">
                <table className="tabela-chamados">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Título</th>
                            <th>Categoria</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                            <th className="coluna-acoes">Ações</th>
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
                                        <MenuAcoesChamado
                                            chamado={chamado}
                                            visualizar={() => visualizarChamado(chamado)}
                                            editar={() => editarChamado(chamado)}
                                            excluir={() => excluirChamado(chamado)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}

                        {chamadosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={6} className="tabela-vazia">
                                    {carregando ? "Carregando chamados..." : "Nenhum chamado encontrado."}
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

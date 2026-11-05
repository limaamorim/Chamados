import { useId, useMemo, useRef, useState } from "react";
import { filtrarChamados, validarPeriodoDatas } from "../../utils/filtrosChamados";
import Mensagem from "../ui/Mensagem";
import {
    obterStatus,
    obterCategoria,
    obterPrioridade,
} from "../../utils/chamados";

import { Cr2cd_chamadoscr2cd_status, Cr2cd_chamadoscr2cd_prioridade } from "../../generated/models/Cr2cd_chamadosModel";
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import CampoPesquisa from "../ui/CampoPesquisa";
import Button from "../ui/Button";
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
    paginacao?: boolean;
};

function ChamadosTable({
    chamados,
    carregando = false,
    erroCarregamento = false,
    mostrarBarraAcoes = true,
    paginacao = false,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {
    // Estado local da pesquisa: funciona como uma variável de contexto desta interface.
    const [pesquisa, setPesquisa] = useState("");

    const [statusSelecionado, setStatusSelecionado] = useState("todos");
    const [filtroAberto, setFiltroAberto] = useState(false);
    const [prioridadeSelecionada, setPrioridadeSelecionada] = useState("todos");
    const [filtroPrioridadeAberto, setFiltroPrioridadeAberto] = useState(false);

    const idFiltros = useId();
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");
    const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
    const [erroRelatorio, setErroRelatorio] = useState("");
    const exportando = useRef(false);
    const erroPeriodo = validarPeriodoDatas(dataInicial, dataFinal);
    const filtros = { pesquisa, status: statusSelecionado, prioridade: prioridadeSelecionada, dataInicial, dataFinal };

    // Filtra antes de paginar; o PDF continua usando todos os resultados filtrados.
    const chamadosFiltrados = useMemo(
        () => filtrarChamados(chamados, { pesquisa, status: statusSelecionado, prioridade: prioridadeSelecionada, dataInicial, dataFinal }),
        [chamados, pesquisa, statusSelecionado, prioridadeSelecionada, dataInicial, dataFinal]
    );
    const [pagina, setPagina] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(20);
    const totalFiltrado = chamadosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / itensPorPagina));
    // Evita uma página vazia quando registros são excluídos ou recarregados.
    const paginaAtual = Math.min(pagina, totalPaginas);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const chamadosVisiveis = paginacao
        ? chamadosFiltrados.slice(inicio, inicio + itensPorPagina)
        : chamadosFiltrados;

    // Janela de até cinco páginas, mais os extremos: não cria milhares de botões.
    const primeiraPaginaVisivel = Math.max(1, Math.min(paginaAtual - 2, totalPaginas - 4));
    const ultimaPaginaVisivel = Math.min(totalPaginas, primeiraPaginaVisivel + 4);
    const paginas: (number | string)[] = [];
    if (primeiraPaginaVisivel > 1) {
        paginas.push(1);
        if (primeiraPaginaVisivel > 2) paginas.push("inicio");
    }
    for (let numero = primeiraPaginaVisivel; numero <= ultimaPaginaVisivel; numero++) {
        paginas.push(numero);
    }
    if (ultimaPaginaVisivel < totalPaginas) {
        if (ultimaPaginaVisivel < totalPaginas - 1) paginas.push("fim");
        paginas.push(totalPaginas);
    }

    async function gerarRelatorio() {
        if (exportando.current || carregando || erroCarregamento || erroPeriodo) return;
        exportando.current = true;
        setGerandoRelatorio(true);
        setErroRelatorio("");
        try {
            // A biblioteca do PDF só é carregada quando o usuário solicita o relatório.
            const { baixarRelatorioChamados } = await import("../../utils/relatorioChamados");
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
                    aoAlterar={(valor) => {
                        setPesquisa(valor);
                        setPagina(1);
                    }}
                    placeholder="Pesquisar chamados..."
                />

                <div className="filtro-status">
                    <Button
                        variante="secundario"
                        aria-expanded={filtroAberto}
                        aria-controls={idFiltros + "-status-opcoes"}
                        onClick={() => {
                            setFiltroAberto(!filtroAberto);
                            setFiltroPrioridadeAberto(false);
                        }}
                    >
                        {statusSelecionado === "todos" ? "Filtrar status" : `Status: ${Cr2cd_chamadoscr2cd_status[Number(statusSelecionado) as Cr2cd_chamadoscr2cd_status]}`}
                    </Button>
                    {filtroAberto && (
                        <div className="filtro-status-opcoes" id={idFiltros + "-status-opcoes"}>
                            <label htmlFor={idFiltros + "-status"}>Status do chamado</label>
                            <select
                                id={idFiltros + "-status"}
                                value={statusSelecionado}
                                onChange={(event) => {
                                    setStatusSelecionado(event.target.value);
                                    setPagina(1);
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

                <div className="filtro-status">
                    <Button
                        variante="secundario"
                        aria-expanded={filtroPrioridadeAberto}
                        aria-controls={idFiltros + "-prioridade-opcoes"}
                        onClick={() => {
                            setFiltroPrioridadeAberto(!filtroPrioridadeAberto);
                            setFiltroAberto(false);
                        }}
                    >
                        {prioridadeSelecionada === "todos" ? "Filtrar prioridade" : `Prioridade: ${Cr2cd_chamadoscr2cd_prioridade[Number(prioridadeSelecionada) as Cr2cd_chamadoscr2cd_prioridade]}`}
                    </Button>
                    {filtroPrioridadeAberto && (
                        <div className="filtro-status-opcoes" id={idFiltros + "-prioridade-opcoes"}>
                            <label htmlFor={idFiltros + "-prioridade"}>Prioridade do chamado</label>
                            <select
                                id={idFiltros + "-prioridade"}
                                value={prioridadeSelecionada}
                                onChange={(event) => {
                                    setPrioridadeSelecionada(event.target.value);
                                    setPagina(1);
                                    setFiltroPrioridadeAberto(false);
                                }}
                            >
                                <option value="todos">Todas as prioridades</option>
                                {Object.entries(Cr2cd_chamadoscr2cd_prioridade).map(([codigo, nome]) => (
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
                                onChange={(evento) => {
                                    setDataInicial(evento.target.value);
                                    setPagina(1);
                                }}
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
                                onChange={(evento) => {
                                    setDataFinal(evento.target.value);
                                    setPagina(1);
                                }}
                            />
                        </div>
                        <Button
                            variante="secundario"
                            onClick={() => {
                                setPesquisa("");
                                setStatusSelecionado("todos");
                                setPrioridadeSelecionada("todos");
                                setDataInicial("");
                                setDataFinal("");
                                setFiltroAberto(false);
                                setFiltroPrioridadeAberto(false);
                                setErroRelatorio("");
                                setPagina(1);
                            }}
                            disabled={!pesquisa && statusSelecionado === "todos" && prioridadeSelecionada === "todos" && !dataInicial && !dataFinal}
                        >
                            Limpar filtros
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
                            <th>Data de abertura</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                            <th className="coluna-acoes">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {chamadosVisiveis.map((chamado) => {
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

                                    <td>
                                        {chamado.cr2cd_datadeabertura
                                            ? new Date(chamado.cr2cd_datadeabertura).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
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
                                <td colSpan={7} className="tabela-vazia">
                                    {carregando ? "Carregando chamados..." : "Nenhum chamado encontrado."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {paginacao && (
                <div className="chamados-paginacao">
                    <p className="paginacao-resumo" role="status" aria-atomic="true">
                        Mostrando {totalFiltrado === 0 ? 0 : inicio + 1}–{Math.min(inicio + itensPorPagina, totalFiltrado)} de {totalFiltrado} chamados
                    </p>

                    <div className="paginacao-tamanho">
                        <label htmlFor={idFiltros + "-itens"}>Itens por página</label>
                        <select
                            id={idFiltros + "-itens"}
                            value={itensPorPagina}
                            onChange={(evento) => {
                                setItensPorPagina(Number(evento.target.value));
                                setPagina(1);
                            }}
                        >
                            {[10, 20, 50, 100].map((quantidade) => (
                                <option key={quantidade} value={quantidade}>{quantidade}</option>
                            ))}
                        </select>
                    </div>

                    <nav className="paginacao-navegacao" aria-label="Paginação de chamados">
                        <button
                            type="button"
                            disabled={paginaAtual === 1 || carregando}
                            onClick={() => setPagina(paginaAtual - 1)}
                        >
                            Anterior
                        </button>
                        {paginas.map((numero) => typeof numero === "number" ? (
                            <button
                                key={numero}
                                type="button"
                                aria-label={`Página ${numero}`}
                                aria-current={paginaAtual === numero ? "page" : undefined}
                                disabled={carregando}
                                onClick={() => setPagina(numero)}
                            >
                                {numero}
                            </button>
                        ) : (
                            <span key={numero} className="paginacao-reticencias" aria-hidden="true">…</span>
                        ))}
                        <button
                            type="button"
                            disabled={paginaAtual === totalPaginas || carregando}
                            onClick={() => setPagina(paginaAtual + 1)}
                        >
                            Próxima
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}

export default ChamadosTable;

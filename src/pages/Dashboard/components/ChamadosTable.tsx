import { useState } from "react";
import {
    obterStatus,
    obterCategoria,
    obterPrioridade,
    podeAlterarChamado,
    obterProximoStatus,
    STATUS_ABERTO,
    formatarDataAbertura,
} from "../../../utils/chamados";

import { Cr2cd_chamadoscr2cd_status } from "../../../generated/models/Cr2cd_chamadosModel";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import CampoPesquisa from "../../../components/ui/CampoPesquisa";
import Icone from "../../../components/ui/Icone";
import Button from "../../../components/ui/Button";

import "./ChamadosTable.css";

type ChamadosTableProps = {
    chamados: Cr2cd_chamados[];
    ocupado: boolean;
    avancarStatus: (chamado: Cr2cd_chamados) => void;
    recarregar: () => void;

    abrirNovoChamado: () => void;
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

function ChamadosTable({
    chamados,
    ocupado,
    avancarStatus,
    recarregar,
    abrirNovoChamado,
    visualizarChamado,
    editarChamado,
    excluirChamado,
}: ChamadosTableProps) {
    // useState guarda um valor; o setter muda esse valor e atualiza a interface.
    // Lembra UpdateContext: pesquisa e status selecionado pertencem a este componente.
    const [pesquisa, setPesquisa] = useState("");

    const [statusSelecionado, setStatusSelecionado] = useState("todos");

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
                    <label htmlFor="status-chamados">Status</label>
                    <select id="status-chamados" value={statusSelecionado}
                        onChange={(event) => setStatusSelecionado(event.target.value)}>
                        <option value="todos">Todos os status</option>
                        {Object.entries(Cr2cd_chamadoscr2cd_status).map(([codigo, nome]) => (
                            <option key={codigo} value={codigo}>{nome}</option>
                        ))}
                    </select>
                </div>
                <Button variante="secundario" onClick={recarregar} disabled={ocupado}>
                    Atualizar
                </Button>

                <Button onClick={abrirNovoChamado} icone={<Icone nome="adicionar" />}>
                    Novo chamado
                </Button>
            </div>

            <p className="resumo-tabela" role="status">
                {chamadosFiltrados.length} de {chamados.length} chamados
                {ocupado && " • Salvando alteração..."}
            </p>
            <div className="tabela-container" role="region" aria-label="Lista de chamados" tabIndex={0}>
                <table className="tabela-chamados" aria-label="Chamados recebidos">
                    <thead>
                        <tr>
                            <th scope="col">Número</th>
                            <th scope="col">Título</th>
                            <th scope="col">Categoria</th>
                            <th scope="col">Prioridade</th>
                            <th scope="col">Status</th>
                            <th scope="col">Solicitante</th>
                            <th scope="col">Abertura</th>
                            <th scope="col" className="coluna-acoes">Ações</th>
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
                                        CH-{chamado.cr2cd_numero ?? "-"}
                                    </td>

                                    <td>{chamado.cr2cd_titulo ?? "-"}</td>

                                    <td>{categoria}</td>
                                    <td><span className={`prioridade prioridade-${chamado.cr2cd_prioridade}`}>
                                        {prioridade}
                                    </span></td>

                                    <td>
                                        <span
                                            className={`status status-${status
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {status}
                                        </span>
                                    </td>

                                    <td className="solicitante-chamado">{chamado.cr2cd_solicitante || "-"}</td>
                                    <td className="data-chamado">{formatarDataAbertura(chamado)}</td>
                                    <td>
                                        <div className="acoes-chamado">
                                            <button
                                                className="botao-acao botao-visualizar"
                                                onClick={() =>
                                                    visualizarChamado(chamado)
                                                }
                                                title="Visualizar chamado"
                                                aria-label={`Visualizar chamado CH-${chamado.cr2cd_numero ?? "-"}`}
                                                disabled={ocupado}
                                            >
                                                <Icone nome="visualizar" />
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
                                                        aria-label={`Editar chamado CH-${chamado.cr2cd_numero ?? "-"}`}
                                                        disabled={ocupado}
                                                    >
                                                        <Icone nome="editar" />
                                                    </button>

                                                    <button
                                                        className="botao-acao botao-excluir"
                                                        onClick={() =>
                                                            excluirChamado(
                                                                chamado
                                                            )
                                                        }
                                                        title="Excluir chamado"
                                                        aria-label={`Excluir chamado CH-${chamado.cr2cd_numero ?? "-"}`}
                                                        disabled={ocupado}
                                                    >
                                                        <Icone nome="excluir" />
                                                    </button>
                                                </>
                                            )}
                                            {/* If/Visible: cada status permite apenas a próxima etapa. */}
                                            {obterProximoStatus(chamado) !== null && (
                                                <button type="button" className="botao-etapa"
                                                    disabled={ocupado}
                                                    onClick={() => avancarStatus(chamado)}>
                                                    <Icone nome={chamado.cr2cd_status === STATUS_ABERTO ? "iniciar" : "verificar"} />
                                                    {chamado.cr2cd_status === STATUS_ABERTO ? "Iniciar atendimento" : "Resolver chamado"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {chamadosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={8} className="tabela-vazia">
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

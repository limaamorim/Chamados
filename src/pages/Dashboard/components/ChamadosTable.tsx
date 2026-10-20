import { classeBadge, formatarDataAbertura, obterStatus, obterCategoria, obterPrioridade } from "../../../utils/chamados";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import MenuAcoesChamado from "./MenuAcoesChamado";
import "./ChamadosTable.css";

type Props = {
    chamados: Cr2cd_chamados[];
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

// Recebe somente os itens da página atual. Não busca dados nem controla filtros.
export default function ChamadosTable({ chamados, ...acoes }: Props) {
    return (
        <div className="tabela-container">
            <table className="tabela-chamados" aria-label="Meus chamados">
                <thead><tr>
                    <th scope="col">Número</th><th scope="col">Título</th>
                    <th scope="col">Categoria</th><th scope="col">Prioridade</th>
                    <th scope="col">Status</th><th scope="col">Data de abertura</th>
                    <th scope="col">Ações</th>
                </tr></thead>
                <tbody>
                    {chamados.map((chamado) => {
                        const status = obterStatus(chamado);
                        const prioridade = obterPrioridade(chamado);
                        return (
                            <tr key={chamado.cr2cd_chamadoid}>
                                <td className="numero-chamado">CH-{chamado.cr2cd_numero ?? "-"}</td>
                                <td>{chamado.cr2cd_titulo ?? "-"}</td>
                                <td>{obterCategoria(chamado)}</td>
                                <td><span className={`prioridade prioridade-${classeBadge(prioridade)}`}>{prioridade}</span></td>
                                <td><span className={`status status-${classeBadge(status)}`}>{status}</span></td>
                                <td>{formatarDataAbertura(chamado)}</td>
                                <td><MenuAcoesChamado chamado={chamado} {...acoes} /></td>
                            </tr>
                        );
                    })}
                    {chamados.length === 0 && <tr><td colSpan={7} className="tabela-vazia">Nenhum chamado encontrado.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

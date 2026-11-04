import { useId } from "react";
import type { GrupoChamados } from "../../../utils/resumoChamados";
import "./GraficoChamados.css";

type Props = {
    titulo: string;
    grupos: GrupoChamados[];
    variante?: "categoria" | "status";
};

const coresCategoria = ["#087ed8", "#8b6bd6", "#27a699", "#e6a13b", "#dc6c91", "#5969ba", "#607d9e"];
const coresStatus: Record<string, string> = {
    Aberto: "#087ed8",
    "Em andamento": "#d08a24",
    Resolvido: "#2b9956",
};

export default function GraficoChamados({ titulo, grupos, variante = "categoria" }: Props) {
    const tituloId = useId();
    
    const maior = Math.max(1, ...grupos.map((grupo) => grupo.total));
    const total = grupos.reduce((soma, grupo) => soma + grupo.total, 0);

    function porcentagem(quantidade: number) {
        return total === 0 ? 0 : (quantidade / total) * 100;
    }

    function formatarPorcentagem(quantidade: number) {
        return porcentagem(quantidade).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
    }

    return (
        <section className={`grafico-chamados grafico-${variante}`} aria-labelledby={tituloId}>
            <div className="grafico-cabecalho">
                <h2 id={tituloId}>{titulo}</h2>
                <span>{total} chamados</span>
            </div>
            {total === 0 && <p className="grafico-vazio">Nenhum chamado cadastrado.</p>}
            {variante === "categoria" ? (
                <div className="grafico-rosca-conteudo">
                    <svg
                        className="grafico-rosca"
                        viewBox="0 0 240 240"
                        role="img"
                        aria-label={`Chamados por categoria. Total: ${total} chamados. Quantidades e porcentagens na legenda.`}
                    >
                        <circle className="rosca-fundo" cx="120" cy="120" r="88" />
                        {grupos.map((grupo, indice) => {
                            // pathLength normaliza a volta em 100; cada segmento ocupa sua porcentagem real.
                            const inicio = grupos.slice(0, indice).reduce((soma, item) => soma + porcentagem(item.total), 0);
                            return grupo.total > 0 && (
                                <circle
                                    key={grupo.nome}
                                    className="rosca-segmento"
                                    cx="120"
                                    cy="120"
                                    r="88"
                                    pathLength="100"
                                    stroke={coresCategoria[indice % coresCategoria.length]}
                                    strokeDasharray={`${porcentagem(grupo.total)} ${100 - porcentagem(grupo.total)}`}
                                    strokeDashoffset={-inicio}
                                    transform="rotate(-90 120 120)"
                                >
                                    <title>{grupo.nome}: {grupo.total} ({formatarPorcentagem(grupo.total)})</title>
                                </circle>
                            );
                        })}
                        <text x="120" y="116" className="rosca-total">{total}</text>
                        <text x="120" y="140" className="rosca-total-legenda">Total de chamados</text>
                    </svg>
                    <ul className="rosca-legenda">
                        {grupos.map((grupo, indice) => (
                            <li key={grupo.nome}>
                                <span
                                    className="rosca-cor"
                                    style={{ backgroundColor: coresCategoria[indice % coresCategoria.length] }}
                                    aria-hidden="true"
                                />
                                <span className="rosca-categoria">{grupo.nome}</span>
                                <strong>{grupo.total}</strong>
                                <span className="rosca-porcentagem">{formatarPorcentagem(grupo.total)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="grafico-colunas-area">
                    <ul
                        className="grafico-colunas"
                        style={{
                            gridTemplateColumns: `repeat(${Math.max(1, grupos.length)}, minmax(0, 1fr))`,
                            minWidth: `${grupos.length * 82}px`,
                        }}
                    >
                        {grupos.map((grupo) => (
                            <li key={grupo.nome}>
                                <div className="coluna-area">
                                    <strong className="coluna-quantidade">{grupo.total}</strong>
                                    <div
                                        className="coluna-preenchimento"
                                        style={{
                                            height: `${(grupo.total / maior) * 192}px`,
                                            backgroundColor: coresStatus[grupo.nome] ?? "#68768a",
                                        }}
                                        aria-hidden="true"
                                        title={`${grupo.nome}: ${grupo.total} chamados`}
                                    />
                                </div>
                                <span className="coluna-rotulo">{grupo.nome}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="grafico-legenda">Quantidade de chamados por status</p>
                </div>
            )}
        </section>
    );
}

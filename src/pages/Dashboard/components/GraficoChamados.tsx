import { useId } from "react";
import type { GrupoChamados } from "../../../utils/resumoChamados";
import "./GraficoChamados.css";

type Props = {
    titulo: string;
    grupos: GrupoChamados[];
    variante?: "categoria" | "status";
};

// As barras usam as contagens da lista real; os números e rótulos também são legíveis sem cores.
export default function GraficoChamados({ titulo, grupos, variante = "categoria" }: Props) {
    const tituloId = useId();
    const maior = Math.max(1, ...grupos.map((grupo) => grupo.total));
    const total = grupos.reduce((soma, grupo) => soma + grupo.total, 0);

    return (
        <section className={`grafico-chamados grafico-${variante}`} aria-labelledby={tituloId}>
            <div className="grafico-cabecalho">
                <h2 id={tituloId}>{titulo}</h2>
                <span>{total} chamados</span>
            </div>
            {total === 0 && <p className="grafico-vazio">Nenhum chamado cadastrado.</p>}
            <ul className="grafico-barras">
                {grupos.map((grupo, indice) => (
                    <li key={grupo.nome}>
                        <div className="grafico-rotulo">
                            <span>{grupo.nome}</span>
                            <strong>{grupo.total}</strong>
                        </div>
                        <div className="grafico-trilho" aria-hidden="true">
                            <span
                                className={`grafico-barra grafico-cor-${indice % 6}`}
                                style={{ width: `${(grupo.total / maior) * 100}%` }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
            <p className="grafico-legenda">Quantidade de chamados</p>
        </section>
    );
}

import type { ReactNode } from "react";
import "./KpiCard.css";

type KpiCardProps = {
    titulo: string;
    valor: number;
    icone: ReactNode;
    cor: "azul" | "laranja" | "verde" | "roxo";
};

function KpiCard({ titulo, valor, icone, cor }: KpiCardProps) {
    return (
        <article className={`kpi-card kpi-card-${cor}`}>
            <div>
                <span>{titulo}</span>
                <strong>{valor}</strong>
            </div>

            <div className={`kpi-icone ${cor}`} aria-hidden="true">
                {icone}
            </div>
        </article>
    );
}

export default KpiCard;
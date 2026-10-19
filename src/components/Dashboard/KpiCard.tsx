import "./KpiCard.css";

type KpiCardProps = {
    titulo: string;
    valor: number;
    icone: string;
    cor: "azul" | "laranja" | "verde" | "roxo";
};

function KpiCard({ titulo, valor, icone, cor }: KpiCardProps) {
    return (
        <article className="kpi-card">
            <div>
                <span>{titulo}</span>
                <strong>{valor}</strong>
            </div>

            <div className={`kpi-icone ${cor}`}>
                {icone}
            </div>
        </article>
    );
}

export default KpiCard;
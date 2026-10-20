import "./KpiCard.css";

type KpiCardProps = {
    titulo: string;
    valor: number;
    icone: string;
    cor: "azul" | "laranja" | "verde" | "roxo";
    ativo: boolean;
    aoClicar: () => void;
    disabled?: boolean;
};

function KpiCard({ titulo, valor, icone, cor, ativo, aoClicar, disabled }: KpiCardProps) {
    return (
        <button type="button" className={`kpi-card${ativo ? " kpi-card-ativo" : ""}`} aria-pressed={ativo} onClick={aoClicar} disabled={disabled}>
            <span className="kpi-dados">
                <span>{titulo}</span>
                <strong>{valor}</strong>
            </span>

            <span className={`kpi-icone ${cor}`} aria-hidden="true">{icone}</span>
        </button>
    );
}

export default KpiCard;

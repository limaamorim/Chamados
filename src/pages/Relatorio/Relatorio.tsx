import "./Relatorio.css";

function Relatorios() {
    const urlPowerBI =
        "https://app.powerbi.com/reportEmbed?reportId=004377e9-f8fa-4d98-9820-fdd5316a3a32&autoAuth=true&ctid=02543ce8-b773-43d0-9cf1-298729881b0d";

    return (
        <section className="pagina-relatorios">
            <h2>Relatórios de Chamados</h2>
            <p>
                Indicadores e análises do sistema Caze.
            </p>

            <iframe
                title="Relatório Power BI"
                src={urlPowerBI}
                width="100%"
                height="700"
                style={{ border: "none" }}
                allowFullScreen
            />
        </section>
    );
}

export default Relatorios;
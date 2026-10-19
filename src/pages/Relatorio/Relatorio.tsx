import Header from "../../components/ui/Header";
import "./Relatorio.css";

function Relatorios() {
    // Endereço do relatório incorporado. Esta página apenas exibe o Power BI.
    const urlPowerBI =
        "https://app.powerbi.com/reportEmbed?reportId=004377e9-f8fa-4d98-9820-fdd5316a3a32&autoAuth=true&ctid=02543ce8-b773-43d0-9cf1-298729881b0d";

    // Interface com o mesmo cabeçalho das demais páginas.
    return (
        <section className="pagina-relatorios">
            <Header
                titulo="Relatórios de chamados"
                descricao="Indicadores e análises do sistema Caze."
            />

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
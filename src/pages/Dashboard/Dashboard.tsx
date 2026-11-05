// Transforma a lista compartilhada em indicadores, gráficos e chamados recentes.
import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import KpiCard from "./components/KpiCard";
import ChamadosTable from "../../components/chamados/ChamadosTable";
import type { AcoesChamados } from "../../components/chamados/ChamadosTable";
import GraficoChamados from "./components/GraficoChamados";
import type { EstadoChamados } from "../../hooks/useChamados";
import { useDashboard } from "../../hooks/useDashboard";
import "./Dashboard.css";

type DashboardProps = {
    dados: EstadoChamados;
    acoes: AcoesChamados;
    verTodos: () => void;
};

export default function Dashboard({ dados, acoes, verTodos }: DashboardProps) {
    const { mensagem, aviso, recarregar } = dados;
    const { dados: resumo, carregando, erro } = useDashboard(dados.versao);
    const { abertos = 0, emAndamento = 0, resolvidos = 0, total = 0, porCategoria = [], porStatus = [], recentes = [] } = resumo ?? {};

    return (
        <Pagina
            titulo="Visão geral"
            descricao="Acompanhe os indicadores e os chamados mais recentes."
            mensagem={mensagem}
            erro={erro}
            aviso={aviso}
        >
            <div className="kpis">
                <KpiCard
                    titulo="Abertos"
                    valor={abertos}
                    icone="▣"
                    cor="azul"
                />
                <KpiCard
                    titulo="Em andamento"
                    valor={emAndamento}
                    icone="◷"
                    cor="laranja"
                />
                <KpiCard
                    titulo="Resolvidos"
                    valor={resolvidos}
                    icone="✓"
                    cor="verde"
                />
                <KpiCard
                    titulo="Total"
                    valor={total}
                    icone="Σ"
                    cor="roxo"
                />
            </div>
            {carregando && <p role="status">Atualizando chamados...</p>}
            {erro && (
                <Button variante="secundario" onClick={recarregar} disabled={carregando}>
                    Tentar carregar novamente
                </Button>
            )}
            {!erro && (!carregando || recentes.length > 0) && (
                <>
                    <div className="dashboard-graficos">
                        <GraficoChamados
                            titulo="Chamados por Categoria"
                            grupos={porCategoria}
                            variante="categoria"
                        />

                        <GraficoChamados
                            titulo="Chamados por Status"
                            grupos={porStatus}
                            variante="status"
                        />
                    </div>
                    <section aria-labelledby="ultimos-chamados-titulo">
                        <div className="dashboard-secao-topo">
                            <h2 id="ultimos-chamados-titulo">Últimos chamados cadastrados</h2>
                            <Button variante="secundario" onClick={verTodos}>Ver todos</Button>
                        </div>
                        <ChamadosTable
                            chamados={recentes}
                            mostrarBarraAcoes={false}
                            {...acoes}
                        />
                    </section>
                </>
            )}
        </Pagina>
    );
}

import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import KpiCard from "./components/KpiCard";
import ChamadosTable from "../../components/chamados/ChamadosTable";
import type { AcoesChamados } from "../../components/chamados/ChamadosTable";
import GraficoChamados from "./components/GraficoChamados";
import type { EstadoChamados } from "../../hooks/useChamados";
import {
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_status,
} from "../../generated/models/Cr2cd_chamadosModel";
import { agruparChamados, obterUltimosChamados } from "../../utils/resumoChamados";
import { STATUS_ABERTO } from "../../utils/chamados";
import "./Dashboard.css";

type DashboardProps = {
    dados: EstadoChamados;
    acoes: AcoesChamados;
    verTodos: () => void;
};

export default function Dashboard({ dados, acoes, verTodos }: DashboardProps) {
    const { chamados, carregando, erro, mensagem, aviso, recarregar } = dados;
    const abertos = chamados.filter((chamado) => chamado.cr2cd_status === STATUS_ABERTO).length;
    const emAndamento = chamados.filter((chamado) => chamado.cr2cd_status === 997180001).length;
    const resolvidos = chamados.filter((chamado) => chamado.cr2cd_status === 997180002).length;
    const porCategoria = agruparChamados(chamados, "cr2cd_categoria", Cr2cd_chamadoscr2cd_categoria);
    const porStatus = agruparChamados(chamados, "cr2cd_status", Cr2cd_chamadoscr2cd_status);
    const ultimosChamados = obterUltimosChamados(chamados);

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
                    valor={chamados.length}
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
            {!erro && (!carregando || chamados.length > 0) && (
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
                            chamados={ultimosChamados}
                            mostrarBarraAcoes={false}
                            {...acoes}
                        />
                    </section>
                </>
            )}
        </Pagina>
    );
}

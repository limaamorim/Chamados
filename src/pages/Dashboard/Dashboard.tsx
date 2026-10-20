import { useState } from "react";
import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import KpiCard from "./components/KpiCard";
import ChamadosTable from "./components/ChamadosTable";
import DetalhesChamadoModal from "./components/DetalhesChamadoModal";
import EditarChamadoModal from "./components/EditarChamadoModal";
import ExcluirChamadoModal from "./components/ExcluirChamadoModal";
import { useChamados } from "../../hooks/useChamados";
import { useFiltrosChamados } from "../../hooks/useFiltrosChamados";
import FiltrosChamados from "./components/FiltrosChamados";
import Paginacao from "../../components/ui/Paginacao";
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import "./Dashboard.css";

type DashboardProps = { abrirNovoChamado: () => void };
type ModalAtivo = {
    tipo: "detalhes" | "editar" | "excluir";
    chamado: Cr2cd_chamados;
};

export default function Dashboard({ abrirNovoChamado }: DashboardProps) {
    const {
        chamados,
        carregando,
        erro,
        erroOperacao,
        operacao,
        mensagem,
        salvar,
        excluir,
        recarregar,
        limparErroOperacao,
    } = useChamados();
    // Abrir e fechar modais é responsabilidade da interface, não do hook de dados.
    const [modal, setModal] = useState<ModalAtivo | null>(null);

    function abrirModal(tipo: ModalAtivo["tipo"], chamado: Cr2cd_chamados) {
        limparErroOperacao();
        setModal({ tipo, chamado });
    }

    const lista = useFiltrosChamados(chamados);
    const cores = ["azul", "laranja", "verde"] as const;
    const icones = ["▣", "◷", "✓"];
    const titulos = ["Abertos", "Em andamento", "Resolvidos"];

    return (
        <Pagina
            titulo="Meus chamados"
            descricao="Gerencie e acompanhe suas solicitações."
            mensagem={mensagem}
            erro={erro}
        >
            <div className="kpis">
                {lista.indicadores.map((indicador, indice) => (
                    <KpiCard
                        key={indicador.codigo}
                        titulo={titulos[indice] ?? indicador.nome}
                        valor={indicador.total}
                        icone={icones[indice] ?? "▣"}
                        cor={cores[indice] ?? "azul"}
                        ativo={lista.filtros.status === String(indicador.codigo)}
                        aoClicar={() => lista.alterarFiltro("status", String(indicador.codigo))}
                        disabled={carregando}
                    />
                ))}
                <KpiCard titulo="Total" valor={chamados.length} icone="Σ" cor="roxo"
                    ativo={!lista.filtros.status} aoClicar={() => lista.alterarFiltro("status", "")} disabled={carregando} />
            </div>
            {carregando && <p role="status">Carregando chamados...</p>}
            {erro && (
                <Button
                    variante="secundario"
                    onClick={recarregar}
                    disabled={carregando}
                >
                    Tentar carregar novamente
                </Button>
            )}
            {!carregando && !erro && (
                <>
                    <FiltrosChamados filtros={lista.filtros} alterar={lista.alterarFiltro} abrirNovoChamado={abrirNovoChamado} />
                    <ChamadosTable
                        chamados={lista.chamadosPagina}
                        visualizarChamado={(chamado) => abrirModal("detalhes", chamado)}
                        editarChamado={(chamado) => abrirModal("editar", chamado)}
                        excluirChamado={(chamado) => abrirModal("excluir", chamado)}
                    />
                    <Paginacao pagina={lista.paginaAtual} totalPaginas={lista.totalPaginas} totalItens={lista.totalFiltrados} aoMudar={lista.mudarPagina} />
                </>
            )}
            {modal?.tipo === "detalhes" && (
                <DetalhesChamadoModal
                    chamado={modal.chamado}
                    fechar={() => setModal(null)}
                />
            )}
            {modal?.tipo === "editar" && (
                <EditarChamadoModal
                    key={modal.chamado.cr2cd_chamadoid}
                    chamado={modal.chamado}
                    erro={erroOperacao}
                    salvando={operacao === "salvar"}
                    fechar={() => setModal(null)}
                    salvar={(dados) => salvar(modal.chamado, dados)}
                />
            )}
            {modal?.tipo === "excluir" && (
                <ExcluirChamadoModal
                    chamado={modal.chamado}
                    erro={erroOperacao}
                    excluindo={operacao === "excluir"}
                    fechar={() => setModal(null)}
                    confirmar={() => excluir(modal.chamado)}
                />
            )}
        </Pagina>
    );
}

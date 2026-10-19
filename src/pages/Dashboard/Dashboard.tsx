import { useState } from "react";
import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import KpiCard from "./components/KpiCard";
import ChamadosTable from "./components/ChamadosTable";
import DetalhesChamadoModal from "./components/DetalhesChamadoModal";
import EditarChamadoModal from "./components/EditarChamadoModal";
import ExcluirChamadoModal from "./components/ExcluirChamadoModal";
import { useChamados } from "../../hooks/useChamados";
import { podeAlterarChamado } from "../../utils/chamados";
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

    // Filter: seleciona cada status na lista carregada; length conta os registros.
    const abertos = chamados.filter(podeAlterarChamado).length;
    const emAndamento = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180001
    ).length;
    const resolvidos = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180002
    ).length;

    return (
        <Pagina
            titulo="Meus chamados"
            descricao="Gerencie e acompanhe suas solicitações."
            mensagem={mensagem}
            erro={erro}
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
                <ChamadosTable
                    chamados={chamados}
                    abrirNovoChamado={abrirNovoChamado}
                    visualizarChamado={(chamado) =>
                        abrirModal("detalhes", chamado)
                    }
                    editarChamado={(chamado) => abrirModal("editar", chamado)}
                    excluirChamado={(chamado) => abrirModal("excluir", chamado)}
                />
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

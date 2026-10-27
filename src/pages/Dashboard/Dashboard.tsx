import { useState } from "react";
import Pagina from "../../components/layout/Pagina";
import Icone from "../../components/ui/Icone";
import Mensagem from "../../components/ui/Mensagem";
import Button from "../../components/ui/Button";
import KpiCard from "./components/KpiCard";
import ChamadosTable from "./components/ChamadosTable";
import DetalhesChamadoModal from "./components/DetalhesChamadoModal";
import EditarChamadoModal from "./components/EditarChamadoModal";
import ExcluirChamadoModal from "./components/ExcluirChamadoModal";
import { useChamados } from "../../hooks/useChamados";
import { podeAlterarChamado, STATUS_EM_ANDAMENTO, STATUS_RESOLVIDO } from "../../utils/chamados";
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
        avancarStatus,
        excluir,
        recarregar,
        limparErroOperacao,
    } = useChamados();
    // useState → ideia de UpdateContext: guarda qual modal e qual chamado estão abertos.
    // O chamado vem da linha clicada (lembra ThisItem), sem executar LookUp.
    const [modal, setModal] = useState<ModalAtivo | null>(null);

    function abrirModal(tipo: ModalAtivo["tipo"], chamado: Cr2cd_chamados) {
        limparErroOperacao();
        setModal({ tipo, chamado });
    }

    // filter(...).length → CountRows(Filter(...)): conta cada status para os cartões.
    // chamados.length → CountRows(chamados). Os cartões usam a lista completa carregada,
    // enquanto a pesquisa e o filtro de status atuam somente na tabela filha.
    const abertos = chamados.filter(podeAlterarChamado).length;
    const emAndamento = chamados.filter(
        (chamado) => chamado.cr2cd_status === STATUS_EM_ANDAMENTO
    ).length;
    const resolvidos = chamados.filter(
        (chamado) => chamado.cr2cd_status === STATUS_RESOLVIDO
    ).length;

    return (
        <Pagina
            titulo="Gerenciar chamados"
            descricao="Acompanhe e gerencie as solicitações recebidas."
            mensagem={mensagem}
            erro={erro}
        >
            <div className="kpis">
                <KpiCard
                    titulo="Abertos"
                    valor={abertos}
                    icone={<Icone nome="chamados" />}
                    cor="azul"
                />
                <KpiCard
                    titulo="Em andamento"
                    valor={emAndamento}
                    icone={<Icone nome="relogio" />}
                    cor="laranja"
                />
                <KpiCard
                    titulo="Resolvidos"
                    valor={resolvidos}
                    icone={<Icone nome="verificar" />}
                    cor="verde"
                />
                <KpiCard
                    titulo="Total"
                    valor={chamados.length}
                    icone={<Icone nome="grafico" />}
                    cor="roxo"
                />
            </div>
            {!modal && <Mensagem tipo="erro">{erroOperacao}</Mensagem>}
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
                    ocupado={operacao !== null}
                    avancarStatus={(chamado) => { void avancarStatus(chamado); }}
                    recarregar={recarregar}
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

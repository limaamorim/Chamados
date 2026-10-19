import { useEffect, useState } from "react";
import { Cr2cd_chamadosService } from "../../generated/services/Cr2cd_chamadosService"
import Header from "../../components/ui/Header";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChamadosTable from "../../components/Dashboard/ChamadosTable";
import DetalhesChamadoModal from "../../components/Dashboard/DetalhesChamadoModal";
import EditarChamadoModal from "../../components/Dashboard/EditarChamadoModal";
import ExcluirChamadoModal from "../../components/Dashboard/ExcluirChamadoModal";

import {
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_prioridade,
    Cr2cd_chamadoscr2cd_status,
} from "../../generated/models/Cr2cd_chamadosModel";

import type {
    Cr2cd_chamados,
} from "../../generated/models/Cr2cd_chamadosModel";

import "./Dashboard.css";

type DashboardProps = {
    abrirNovoChamado: () => void;
};

function Dashboard({ abrirNovoChamado }: DashboardProps) {
    const [chamados, setChamados] = useState<Cr2cd_chamados[]>([]);
    const [chamadoSelecionado, setChamadoSelecionado] =
        useState<Cr2cd_chamados | null>(null);

    const [chamadoEditando, setChamadoEditando] =
        useState<Cr2cd_chamados | null>(null);

    const [chamadoExcluindo, setChamadoExcluindo] =
        useState<Cr2cd_chamados | null>(null);

    const [tituloEdicao, setTituloEdicao] = useState("");
    const [descricaoEdicao, setDescricaoEdicao] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        carregarChamados();
    }, []);

    async function carregarChamados() {
        try {
            setCarregando(true);
            setErro("");

            console.log("Buscando chamados no Dataverse...");

            const resultado = await Cr2cd_chamadosService.getAll({
                orderBy: ["createdon desc"],
            });

            console.log("Resposta Dataverse:", resultado);

            if (resultado.success && resultado.data) {
                setChamados(resultado.data);
            } else {
                setErro("Não foi possível carregar os chamados.");
            }
        } catch (error) {
            console.error("Erro ao buscar chamados:", error);
            setErro("Não foi possível carregar os chamados.");
        } finally {
            setCarregando(false);
        }
    }

    function obterCategoria(chamado: Cr2cd_chamados) {
        if (chamado.cr2cd_categoria === undefined) {
            return "-";
        }

        return (
            Cr2cd_chamadoscr2cd_categoria[chamado.cr2cd_categoria] ?? "-"
        );
    }

    function obterPrioridade(chamado: Cr2cd_chamados) {
        if (chamado.cr2cd_prioridade === undefined) {
            return "-";
        }

        return (
            Cr2cd_chamadoscr2cd_prioridade[chamado.cr2cd_prioridade] ?? "-"
        );
    }

    function obterStatus(chamado: Cr2cd_chamados) {
        if (chamado.cr2cd_status === undefined) {
            return "-";
        }

        return Cr2cd_chamadoscr2cd_status[chamado.cr2cd_status] ?? "-";
    }


    const abertos = chamados.filter(
        (chamado) => obterStatus(chamado) === "Aberto"
    ).length;

    const emAndamento = chamados.filter(
        (chamado) => obterStatus(chamado) === "Em andamento"
    ).length;

    const resolvidos = chamados.filter(
        (chamado) => obterStatus(chamado) === "Resolvido"
    ).length;

    async function salvarEdicao() {
        if (!chamadoEditando) {
            return;
        }

        if (obterStatus(chamadoEditando) !== "Aberto") {
            setErro("Somente chamados abertos podem ser editados.");
            return;
        }

        if (!tituloEdicao.trim() || !descricaoEdicao.trim()) {
            setErro("Preencha o título e a descrição.");
            return;
        }

        try {
            setSalvandoEdicao(true);
            setErro("");
            setMensagem("");

            const resultado = await Cr2cd_chamadosService.update(
                chamadoEditando.cr2cd_chamadoid,
                {
                    cr2cd_titulo: tituloEdicao.trim(),
                    cr2cd_descricao: descricaoEdicao.trim(),
                    cr2cd_categoria: chamadoEditando.cr2cd_categoria,
                    cr2cd_prioridade: chamadoEditando.cr2cd_prioridade,
                }
            );

            console.log("Resultado da edição:", resultado);

            if (!resultado.success) {
                setErro(
                    resultado.error?.message ??
                    "Não foi possível atualizar o chamado."
                );
                return;
            }

            setChamadoEditando(null);
            setMensagem("Chamado atualizado com sucesso!");

            await carregarChamados();

            window.setTimeout(() => {
                setMensagem("");
            }, 3000);
        } catch (error) {
            console.error("Erro ao atualizar chamado:", error);
            setErro("Não foi possível atualizar o chamado.");
        } finally {
            setSalvandoEdicao(false);
        }
    }
    async function confirmarExclusao() {
        if (!chamadoExcluindo) {
            return;
        }

        if (obterStatus(chamadoExcluindo) !== "Aberto") {
            setErro("Somente chamados abertos podem ser excluídos.");
            return;
        }

        try {
            setExcluindo(true);
            setErro("");
            setMensagem("");

            await Cr2cd_chamadosService.delete(
                chamadoExcluindo.cr2cd_chamadoid
            );

            setChamadoExcluindo(null);
            setMensagem("Chamado excluído com sucesso!");

            await carregarChamados();

            window.setTimeout(() => {
                setMensagem("");
            }, 3000);
        } catch (error) {
            console.error("Erro ao excluir chamado:", error);
            setErro("Não foi possível excluir o chamado.");
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <section className="dashboard">
            <Header
                titulo="Meus chamados"
                descricao="Gerencie e acompanhe suas solicitações."
                mensagem={mensagem}
            />

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

            {carregando && (
                <p>Carregando chamados...</p>
            )}

            {erro && (
                <p className="mensagem-erro">{erro}</p>
            )}

            {!carregando && !erro && (
                <ChamadosTable
                    chamados={chamados}
                    obterStatus={obterStatus}
                    obterCategoria={obterCategoria}
                    obterPrioridade={obterPrioridade}
                    abrirNovoChamado={abrirNovoChamado}
                    visualizarChamado={(chamado) =>
                        setChamadoSelecionado(chamado)
                    }
                    editarChamado={(chamado) => {
                        setChamadoEditando(chamado);
                        setTituloEdicao(chamado.cr2cd_titulo ?? "");
                        setDescricaoEdicao(chamado.cr2cd_descricao ?? "");
                    }}
                    excluirChamado={(chamado) => {
                        setChamadoExcluindo(chamado);
                    }}
                />
            )}

            {chamadoSelecionado && (
                <DetalhesChamadoModal
                    chamado={chamadoSelecionado}
                    fechar={() => setChamadoSelecionado(null)}
                    obterStatus={obterStatus}
                    obterCategoria={obterCategoria}
                    obterPrioridade={obterPrioridade}
                />
            )}


            {chamadoEditando && (
                <EditarChamadoModal
                    chamado={chamadoEditando}
                    titulo={tituloEdicao}
                    setTitulo={setTituloEdicao}
                    descricao={descricaoEdicao}
                    setDescricao={setDescricaoEdicao}
                    salvando={salvandoEdicao}
                    fechar={() => setChamadoEditando(null)}
                    salvar={salvarEdicao}
                    obterStatus={obterStatus}
                    atualizarChamado={setChamadoEditando}
                />
            )}


            {chamadoExcluindo && (
                <ExcluirChamadoModal
                    chamado={chamadoExcluindo}
                    excluindo={excluindo}
                    fechar={() => setChamadoExcluindo(null)}
                    confirmar={confirmarExclusao}
                />
            )}

        </section>
    );
}

export default Dashboard;
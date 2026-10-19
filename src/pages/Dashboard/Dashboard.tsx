import { useEffect, useState } from "react";
import { listarChamados, atualizarChamado, excluirChamado } from "../../services/chamadosService";
import {
    obterCategoria,
    obterPrioridade,
    obterStatus,
    podeAlterarChamado,
    validarCamposChamado,
    CATEGORIA_PADRAO,
    PRIORIDADE_PADRAO,
} from "../../utils/chamados";
import Header from "../../components/ui/Header";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChamadosTable from "../../components/Dashboard/ChamadosTable";
import DetalhesChamadoModal from "../../components/Dashboard/DetalhesChamadoModal";
import EditarChamadoModal from "../../components/Dashboard/EditarChamadoModal";
import ExcluirChamadoModal from "../../components/Dashboard/ExcluirChamadoModal";

import type {
    Cr2cd_chamados,
} from "../../generated/models/Cr2cd_chamadosModel";

import "./Dashboard.css";

type DashboardProps = {
    abrirNovoChamado: () => void;
};

function Dashboard({ abrirNovoChamado }: DashboardProps) {
    // Estados da página: lista, modais, formulário de edição e mensagens.
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
    const [erroOperacao, setErroOperacao] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [mensagem, setMensagem] = useState("");

    // Busca os dados quando a página é montada. O cancelamento evita atualizar uma página já fechada.
    useEffect(() => {
        let ativo = true;
        listarChamados()
            .then((dados) => { if (ativo) setChamados(dados); })
            .catch((error: unknown) => {
                if (ativo) setErro(error instanceof Error ? error.message : "Não foi possível carregar os chamados.");
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        if (!mensagem) return;
        const timer = window.setTimeout(() => setMensagem(""), 3000);
        return () => window.clearTimeout(timer);
    }, [mensagem]);

    // Recarrega a lista após editar ou excluir, sem esconder o resultado da operação.
    async function carregarChamados() {
        try {
            setCarregando(true);
            setErro("");
            const dados = await listarChamados();
            // Substitui a lista inteira; não acrescenta um item como Collect.
            setChamados(dados);
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível carregar os chamados.");
        } finally {
            setCarregando(false);
        }
    }

    // filter seleciona os registros de cada status; length conta os resultados para os cards.
    const abertos = chamados.filter(
        (chamado) => podeAlterarChamado(chamado)
    ).length;

    const emAndamento = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180001
    ).length;

    const resolvidos = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180002
    ).length;

    // Os handlers controlam a interface. As operações de dados estão no service.
    async function salvarEdicao() {
        if (!chamadoEditando || salvandoEdicao) return;
        const erroValidacao = validarCamposChamado(tituloEdicao, descricaoEdicao);
        if (erroValidacao) {
            setErroOperacao(erroValidacao);
            return;
        }

        try {
            setSalvandoEdicao(true);
            setErroOperacao("");
            setMensagem("");
            await atualizarChamado(chamadoEditando, {
                titulo: tituloEdicao,
                descricao: descricaoEdicao,
                categoria: chamadoEditando.cr2cd_categoria ?? CATEGORIA_PADRAO,
                prioridade: chamadoEditando.cr2cd_prioridade ?? PRIORIDADE_PADRAO,
            });
            setChamadoEditando(null);
            setMensagem("Chamado atualizado com sucesso!");
            await carregarChamados();
        } catch (error) {
            setErroOperacao(error instanceof Error ? error.message : "Não foi possível atualizar o chamado.");
        } finally {
            setSalvandoEdicao(false);
        }
    }

    async function confirmarExclusao() {
        if (!chamadoExcluindo || excluindo) return;
        try {
            setExcluindo(true);
            setErroOperacao("");
            setMensagem("");
            await excluirChamado(chamadoExcluindo);
            setChamadoExcluindo(null);
            setMensagem("Chamado excluído com sucesso!");
            await carregarChamados();
        } catch (error) {
            setErroOperacao(error instanceof Error ? error.message : "Não foi possível excluir o chamado.");
        } finally {
            setExcluindo(false);
        }
    }

    // Interface: cabeçalho, indicadores, tabela e modais.
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
                <p className="mensagem-erro" role="alert">{erro}</p>
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
                        setErroOperacao("");
                        setChamadoEditando(chamado);
                        setTituloEdicao(chamado.cr2cd_titulo ?? "");
                        setDescricaoEdicao(chamado.cr2cd_descricao ?? "");
                    }}
                    excluirChamado={(chamado) => {
                        setErroOperacao("");
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
                    erro={erroOperacao}
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
                    erro={erroOperacao}
                    excluindo={excluindo}
                    fechar={() => setChamadoExcluindo(null)}
                    confirmar={confirmarExclusao}
                />
            )}

        </section>
    );
}

export default Dashboard;

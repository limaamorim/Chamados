// Coordena as páginas, os dados compartilhados e os modais do aplicativo.
import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chamados from "./pages/Chamados/Chamados";
import NovoChamadoModal from "./components/chamados/NovoChamadoModal";
import BaseConhecimento from "./pages/BaseConhecimento/BaseConhecimento";
import Relatorios from "./pages/Relatorio/Relatorio";
import DetalhesChamadoModal from "./components/chamados/DetalhesChamadoModal";
import EditarChamadoModal from "./components/chamados/EditarChamadoModal";
import ExcluirChamadoModal from "./components/chamados/ExcluirChamadoModal";
import { useChamados } from "./hooks/useChamados";
import type { Cr2cd_chamados } from "./generated/models/Cr2cd_chamadosModel";
import "./App.css";

type ModalAtivo =
    | { tipo: "novo" }
    | { tipo: "detalhes" | "editar" | "excluir"; chamado: Cr2cd_chamados };

function App() {
    // Estes estados guardam a página exibida, o modal aberto e a versão usada para reiniciar a listagem.
    const [paginaAtiva, setPaginaAtiva] = useState("chamados");
    const [modal, setModal] = useState<ModalAtivo | null>(null);
    const [versaoLista, setVersaoLista] = useState(0);
    // As operações são compartilhadas; cada página consulta seus próprios dados.
    const dados = useChamados();

    // As ações da tabela chegam aqui com o registro selecionado; erros anteriores são limpos antes de abrir o modal.
    function abrirModal(tipo: "detalhes" | "editar" | "excluir", chamado: Cr2cd_chamados) {
        dados.limparErroOperacao();
        setModal({ tipo, chamado });
    }

    const acoes = {
        visualizarChamado: (chamado: Cr2cd_chamados) => abrirModal("detalhes", chamado),
        editarChamado: (chamado: Cr2cd_chamados) => abrirModal("editar", chamado),
        excluirChamado: (chamado: Cr2cd_chamados) => abrirModal("excluir", chamado),
    };

    function abrirNovoChamado() {
        setModal({ tipo: "novo" });
    }

    function aoCriar(aviso: string) {
        setModal(null);
        // Reinicia pesquisa/filtro para o registro recém-criado aparecer na listagem.
        setVersaoLista((versao) => versao + 1);
        dados.aposCriar(aviso);
    }

    // Escolhe o componente da página sem recarregar o navegador e repassa dados e funções pelas props.
    function exibirPagina() {
        if (paginaAtiva === "novo") {
            return (
                <Chamados
                    key={versaoLista}
                    dados={dados}
                    acoes={acoes}
                    abrirNovoChamado={abrirNovoChamado}
                />
            );
        }
        if (paginaAtiva === "base") {
            return (
                <BaseConhecimento abrirNovoChamado={() => {
                    setPaginaAtiva("novo");
                    abrirNovoChamado();
                }} />
            );
        }
        if (paginaAtiva === "relatorios") return <Relatorios />;
        return (
            <Dashboard
                dados={dados}
                acoes={acoes}
                verTodos={() => setPaginaAtiva("novo")}
            />
        );
    }

    return (
        <div className="app">
            <Sidebar paginaAtiva={paginaAtiva} mudarPagina={setPaginaAtiva} />
            <main className="conteudo-principal">
                {exibirPagina()}
            </main>
            {modal?.tipo === "novo" && (
                <NovoChamadoModal fechar={() => setModal(null)} aoCriar={aoCriar} />
            )}
            {modal?.tipo === "detalhes" && (
                <DetalhesChamadoModal chamado={modal.chamado} fechar={() => setModal(null)} />
            )}
            {modal?.tipo === "editar" && (
                <EditarChamadoModal
                    key={modal.chamado.cr2cd_chamadoid}
                    chamado={modal.chamado}
                    erro={dados.erroOperacao}
                    salvando={dados.operacao === "salvar"}
                    fechar={() => setModal(null)}
                    salvar={(campos) => dados.salvar(modal.chamado, campos)}
                />
            )}
            {modal?.tipo === "excluir" && (
                <ExcluirChamadoModal
                    chamado={modal.chamado}
                    erro={dados.erroOperacao}
                    excluindo={dados.operacao === "excluir"}
                    fechar={() => setModal(null)}
                    confirmar={() => dados.excluir(modal.chamado)}
                />
            )}
        </div>
    );
}

export default App;

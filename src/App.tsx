import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import NovoChamado from "./pages/NovoChamado/NovoChamado";
import NovoChamadoModal from "./pages/NovoChamado/components/NovoChamadoModal";
import BaseConhecimento from "./pages/BaseConhecimento/BaseConhecimento";
import Relatorios from "./pages/Relatorio/Relatorio";
import DetalhesChamadoModal from "./pages/Dashboard/components/DetalhesChamadoModal";
import EditarChamadoModal from "./pages/Dashboard/components/EditarChamadoModal";
import ExcluirChamadoModal from "./pages/Dashboard/components/ExcluirChamadoModal";
import { useChamados } from "./hooks/useChamados";
import type { Cr2cd_chamados } from "./generated/models/Cr2cd_chamadosModel";
import "./App.css";

type ModalAtivo =
    | { tipo: "novo" }
    | { tipo: "detalhes" | "editar" | "excluir"; chamado: Cr2cd_chamados };

function App() {
    const [paginaAtiva, setPaginaAtiva] = useState("chamados");
    const [modal, setModal] = useState<ModalAtivo | null>(null);
    const [versaoLista, setVersaoLista] = useState(0);
    // Uma única lista alimenta as duas páginas, os gráficos e os indicadores.
    const dados = useChamados();

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

    function exibirPagina() {
        if (paginaAtiva === "novo") {
            return (
                <NovoChamado
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

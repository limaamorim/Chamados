
import { useState } from "react";

import Sidebar from "./components/ui/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import NovoChamado from "./pages/NovoChamado/NovoChamado";
import BaseConhecimento from "./pages/BaseConhecimento/BaseConhecimento";
import Relatorios from "./pages/Relatorio/Relatorio";

import "./App.css";

function App() {
    const [paginaAtiva, setPaginaAtiva] = useState("chamados");

    function exibirPagina() {
        if (paginaAtiva === "novo") {
            return (
                <NovoChamado
                    voltar={() => setPaginaAtiva("chamados")}
                />
            );
        }

        if (paginaAtiva === "base") {
            return (
                <BaseConhecimento
                    abrirNovoChamado={() => setPaginaAtiva("novo")}
                />
            );
        }

        // Nova página de relatórios
        if (paginaAtiva === "relatorios") {
            return <Relatorios />;
        }

        return (
            <Dashboard
                abrirNovoChamado={() => setPaginaAtiva("novo")}
            />
        );
    }

    return (
        <div className="app">
            <Sidebar
                paginaAtiva={paginaAtiva}
                mudarPagina={setPaginaAtiva}
            />

            <main className="conteudo-principal">
                {exibirPagina()}
            </main>
        </div>
    );
}

export default App;

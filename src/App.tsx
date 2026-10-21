
import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import NovoChamado from "./pages/NovoChamado/NovoChamado";
import BaseConhecimento from "./pages/BaseConhecimento/BaseConhecimento";
import Relatorios from "./pages/Relatorio/Relatorio";

import "./App.css";

function App() {
    // Estado no componente pai: é compartilhado com a Sidebar por propriedades (props).
    // O setter lembra Set, mas este estado não vira uma variável global automaticamente.
    const [paginaAtiva, setPaginaAtiva] = useState("chamados");

    // Trocar paginaAtiva lembra Navigate: decide qual componente de página mostrar.
    // Aqui não há rota por URL; o estado vive no App e é passado aos filhos por props.
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

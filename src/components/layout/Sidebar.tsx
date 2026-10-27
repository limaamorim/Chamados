import { useState } from "react";
import Icone from "../ui/Icone";
import type { NomeIcone } from "../ui/Icone";
import "./Sidebar.css";

type SidebarProps = {
    paginaAtiva: string;
    mudarPagina: (pagina: string) => void;
};

function Sidebar({ paginaAtiva, mudarPagina }: SidebarProps) {
    const [menuAberto, setMenuAberto] = useState(true);

    const itensMenu = [
        {
            id: "chamados",
            icone: "chamados" as NomeIcone,
            texto: "Gerenciar chamados",
        },
        {
            id: "novo",
            icone: "adicionar" as NomeIcone,
            texto: "Novo chamado",
        },
        {
            id: "base",
            icone: "livro" as NomeIcone,
            texto: "Base de conhecimento",
        },
        {
            id: "relatorios",
            icone: "grafico" as NomeIcone,
            texto: "Relatórios",
        },
    ];

    return (
        <aside className={menuAberto ? "sidebar" : "sidebar sidebar-fechada"}>
            <div className="sidebar-cabecalho">
                {menuAberto && (
                    <div>
                        <h2>Caze</h2>
                        <span>Service Desk</span>
                    </div>
                )}

                <button
                    className="botao-recolher"
                    aria-label={menuAberto ? "Recolher menu" : "Expandir menu"}
                    onClick={() => setMenuAberto(!menuAberto)}
                    title={menuAberto ? "Recolher menu" : "Expandir menu"}
                >
                    <Icone nome="menu" />
                </button>
            </div>

            <nav className="menu">
                {itensMenu.map((item) => (
                    <button
                        key={item.id}
                        aria-label={item.texto}
                        aria-current={
                            paginaAtiva === item.id ? "page" : undefined
                        }
                        className={
                            paginaAtiva === item.id
                                ? "menu-item menu-item-ativo"
                                : "menu-item"
                        }
                        onClick={() => mudarPagina(item.id)}
                        title={!menuAberto ? item.texto : ""}
                    >
                        <span className="menu-icone" aria-hidden="true">
                            <Icone nome={item.icone} />
                        </span>

                        {menuAberto && (
                            <span className="menu-texto">{item.texto}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;

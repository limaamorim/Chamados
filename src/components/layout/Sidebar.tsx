import { useState } from "react";
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
            icone: (
                <svg viewBox="0 0 24 24">
                    <path d="m3 10 9-7 9 7" />
                    <path d="M5 9v12h5v-7h4v7h5V9" />
                </svg>
            ),
            texto: "Visão geral",
        },
        {
            id: "novo",
            icone: (
                <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            ),
            texto: "Chamados",
        },
        {
            id: "base",
            icone: (
                <svg viewBox="0 0 24 24">
                    <path d="M12 5v16" />
                    <path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z" />
                </svg>
            ),
            texto: "Base de conhecimento",
        },
        {
            id: "relatorios",
            icone: (
                <svg viewBox="0 0 24 24">
                    <path d="M4 3v18h17" />
                    <path d="M8 16v-5M13 16V7M18 16v-8" />
                </svg>
            ),
            texto: "Relatórios",
        },
    ];

    return (
        <aside className={menuAberto ? "sidebar" : "sidebar sidebar-fechada"}>
            <div className="sidebar-cabecalho">
                {menuAberto && (
                    <div>
                        <h2>Solicita</h2>
                        <span>Painel de chamados</span>
                    </div>
                )}

                <button
                    className="botao-recolher"
                    aria-label={menuAberto ? "Recolher menu" : "Expandir menu"}
                    onClick={() => setMenuAberto(!menuAberto)}
                    title={menuAberto ? "Recolher menu" : "Expandir menu"}
                >
                    ☰
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
                            {item.icone}
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

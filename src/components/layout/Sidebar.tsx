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
            icone: "▣",
            texto: "Meus chamados",
        },
        {
            id: "novo",
            icone: "+",
            texto: "Novo chamado",
        },
        {
            id: "base",
            icone: "▤",
            texto: "Base de conhecimento",
        },
        {
            id: "relatorios",
            icone: "▥",
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

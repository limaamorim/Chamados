import { useUsuario } from "../../hooks/useUsuario";
import { useTema } from "../../hooks/useTema";
import "./Header.css";

type HeaderProps = {
    titulo: string;
    descricao: string;
};

function Header({ titulo, descricao }: HeaderProps) {
    const { tema, alternarTema } = useTema();
    const nomeUsuario = useUsuario();
    const inicial = nomeUsuario.charAt(0).toUpperCase();

    return (
        <header className="dashboard-header">
            <div className="header-titulo">
                <h1>{titulo}</h1>
                <p>{descricao}</p>
            </div>

            <div className="header-usuario">
                <button
                    type="button"
                    className="botao-tema"
                    onClick={alternarTema}
                    aria-label={tema === "claro" ? "Ativar modo escuro" : "Ativar modo claro"}
                    aria-pressed={tema === "escuro"}
                    title={tema === "claro" ? "Ativar modo escuro" : "Ativar modo claro"}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        {tema === "claro" ? (
                            <path d="M20.5 13.5A8.5 8.5 0 0 1 10.5 3.5a8.5 8.5 0 1 0 10 10Z" />
                        ) : (
                            <>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                            </>
                        )}
                    </svg>
                </button>
                <div className="avatar-usuario">{inicial}</div>

                <div className="dados-usuario">
                    <strong>{nomeUsuario}</strong>
                    <span>Solicitante</span>
                </div>
            </div>
        </header>
    );
}

export default Header;

import { useUsuario } from "../../hooks/useUsuario";
import "./Header.css";

type HeaderProps = {
    titulo: string;
    descricao: string;
};

function Header({ titulo, descricao }: HeaderProps) {
    const nomeUsuario = useUsuario();
    const inicial = nomeUsuario.charAt(0).toUpperCase();

    return (
        <header className="dashboard-header">
            <div className="header-titulo">
                <h1>{titulo}</h1>
                <p>{descricao}</p>
            </div>

            <div className="header-usuario">
                <div className="avatar-usuario">{inicial}</div>

                <div className="dados-usuario">
                    <strong>{nomeUsuario}</strong>
                    <span>Painel de atendimento</span>
                </div>
            </div>
        </header>
    );
}

export default Header;

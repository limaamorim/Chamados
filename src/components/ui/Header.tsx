import { useEffect, useState } from "react";
import { getContext } from "@microsoft/power-apps/app";
import "./Header.css";

type HeaderProps = {
    titulo: string;
    descricao: string;
    mensagem?: string;
};

function Header({ titulo, descricao, mensagem = "" }: HeaderProps) {
    const [nomeUsuario, setNomeUsuario] = useState("Usuário");

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const contexto = await getContext();

                if (contexto.user.fullName) {
                    setNomeUsuario(contexto.user.fullName);
                }
            } catch (error) {
                console.error("Erro ao buscar usuário:", error);
            }
        }

        carregarUsuario();
    }, []);

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
                    <span>Solicitante</span>
                </div>
            </div>

            {mensagem && (
                <div className="mensagem-sucesso" role="status">
                    {mensagem}
                </div>
            )}
        </header>
    );
}

export default Header;
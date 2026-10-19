import type { ReactNode } from "react";
import Header from "./Header";
import Mensagem from "../ui/Mensagem";
import "./Pagina.css";

type PaginaProps = {
    titulo: string;
    descricao: string;
    mensagem?: string;
    erro?: string;
    aviso?: string;
    className?: string;
    children: ReactNode;
};

// Estrutura compartilhada das quatro páginas; cada página fornece apenas seu conteúdo.
export default function Pagina({
    titulo,
    descricao,
    mensagem,
    erro,
    aviso,
    className = "",
    children,
}: PaginaProps) {
    return (
        <section className={`pagina ${className}`}>
            <Header titulo={titulo} descricao={descricao} />
            <Mensagem>{mensagem}</Mensagem>
            <Mensagem tipo="erro">{erro}</Mensagem>
            <Mensagem tipo="aviso">{aviso}</Mensagem>
            {children}
        </section>
    );
}

import type { ReactNode } from "react";

type MensagemProps = {
    tipo?: "sucesso" | "erro" | "aviso";
    children?: ReactNode;
};

// Todas as páginas e modais exibem mensagens da mesma forma.
export default function Mensagem({
    tipo = "sucesso",
    children,
}: MensagemProps) {
    if (!children) return null;
    return (
        <div
            className={`mensagem-${tipo}`}
            role={tipo === "erro" ? "alert" : "status"}
        >
            {children}
        </div>
    );
}

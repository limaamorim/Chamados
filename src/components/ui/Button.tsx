import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: "principal" | "secundario" | "perigo";
    icone?: ReactNode;
};

// Reutiliza aparência e comportamento, preservando as propriedades nativas de um botão.
export default function Button({
    variante = "principal",
    icone,
    children,
    className = "",
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`button button-${variante} ${className}`}
            {...props}
        >
            {icone && <span aria-hidden="true">{icone}</span>}
            {children}
        </button>
    );
}

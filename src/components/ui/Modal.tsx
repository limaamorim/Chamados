import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import "./Modal.css";

type ModalProps = {
    titulo: string;
    subtitulo?: string;
    ocupado?: boolean;
    fechar: () => void;
    children: ReactNode;
    acoes?: ReactNode;
};

// O dialog nativo controla foco e navegação por teclado. As telas fornecem conteúdo e ações.
export default function Modal({
    titulo,
    subtitulo,
    ocupado = false,
    fechar,
    children,
    acoes,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const tituloId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => {
            dialog?.close();
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="modal-dialog"
            aria-labelledby={tituloId}
            aria-busy={ocupado}
            onCancel={(evento) => {
                evento.preventDefault();
                if (!ocupado) fechar();
            }}
            onClick={(evento) => {
                // Fecha somente quando o clique ocorrer fora da caixa, sobre o fundo.
                if (ocupado || evento.target !== evento.currentTarget) return;
                const caixa = evento.currentTarget.getBoundingClientRect();
                if (
                    evento.clientX < caixa.left ||
                    evento.clientX > caixa.right ||
                    evento.clientY < caixa.top ||
                    evento.clientY > caixa.bottom
                )
                    fechar();
            }}
        >
            <div className="modal-topo">
                <div>
                    {subtitulo && (
                        <span className="modal-numero">{subtitulo}</span>
                    )}
                    <h2 id={tituloId}>{titulo}</h2>
                </div>
                <button
                    type="button"
                    className="modal-fechar"
                    onClick={fechar}
                    disabled={ocupado}
                    aria-label={`Fechar ${titulo.toLowerCase()}`}
                >
                    ×
                </button>
            </div>
            <div className="modal-corpo">{children}</div>
            {acoes && <div className="modal-acoes">{acoes}</div>}
        </dialog>
    );
}

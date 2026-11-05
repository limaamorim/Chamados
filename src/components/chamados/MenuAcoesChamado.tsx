// Apresenta as ações de um chamado e posiciona o menu sobre a tabela.
import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import { podeExcluirChamado } from "../../utils/chamados";
import "./MenuAcoesChamado.css";

type Props = {
    chamado: Cr2cd_chamados;
    visualizar: () => void;
    editar: () => void;
    excluir: () => void;
};

export default function MenuAcoesChamado({ chamado, visualizar, editar, excluir }: Props) {
    // As refs acessam menu e botão no navegador; a regra de exclusão define se a ação fica habilitada.
    const menuId = useId();
    const menuRef = useRef<HTMLDivElement>(null);
    const botaoRef = useRef<HTMLButtonElement>(null);
    const permiteExcluir = podeExcluirChamado(chamado);

    // O popover nativo fecha ao clicar fora ou pressionar Escape e permite só um menu aberto.
    // Ele aparece acima da tabela, sem ser cortado pela rolagem horizontal.
    useEffect(() => {
        function fechar() {
            menuRef.current?.hidePopover();
        }
        window.addEventListener("resize", fechar);
        window.addEventListener("scroll", fechar, true);
        return () => {
            window.removeEventListener("resize", fechar);
            window.removeEventListener("scroll", fechar, true);
        };
    }, []);

    // Calcula a posição perto do botão, respeitando as bordas da janela para o menu continuar visível.
    function posicionar(evento: MouseEvent<HTMLButtonElement>) {
        const menu = menuRef.current;
        if (!menu) return;
        const botao = evento.currentTarget.getBoundingClientRect();
        const largura = 192;
        const altura = 144;
        menu.style.left = `${Math.max(8, Math.min(botao.right - largura, window.innerWidth - largura - 8))}px`;
        menu.style.top = `${Math.max(8, botao.bottom + altura + 8 <= window.innerHeight
            ? botao.bottom + 6
            : botao.top - altura - 6)}px`;
    }

    function executar(acao: () => void) {
        menuRef.current?.hidePopover();
        botaoRef.current?.focus();
        // Reaproveita os modais e as operações compartilhados pelo aplicativo.
        acao();
    }

    return (
        <div
            className="acoes-chamado"
            onBlur={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget)) {
                    menuRef.current?.hidePopover();
                }
            }}
        >
            <button
                ref={botaoRef}
                type="button"
                className="botao-menu-acoes"
                aria-label={`Ações do chamado CH-${chamado.cr2cd_numero ?? "-"}`}
                popoverTarget={menuId}
                onClick={posicionar}
            >
                <span aria-hidden="true">...</span>
            </button>
            <div
                ref={menuRef}
                id={menuId}
                popover="auto"
                className="menu-acoes-chamado"
                role="group"
                aria-label="Ações do chamado"
            >
                <button type="button" onClick={() => executar(visualizar)}>
                    <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    Visualizar
                </button>

                <button type="button" onClick={() => executar(editar)}>
                    <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                    </svg>
                    Editar
                </button>

                <button
                    type="button"
                    className="menu-acao-excluir"
                    disabled={!permiteExcluir}
                    title={
                        permiteExcluir
                            ? "Excluir chamado"
                            : "Somente chamados abertos podem ser excluídos."
                    }
                    onClick={() => executar(excluir)}
                >
                    <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                    </svg>
                    Excluir
                </button>
            </div>
        </div>
    );
}

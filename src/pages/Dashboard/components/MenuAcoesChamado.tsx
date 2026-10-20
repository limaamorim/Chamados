import { useEffect, useRef, useState } from "react";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import { podeAlterarChamado } from "../../../utils/chamados";
import "./MenuAcoesChamado.css";

type Props = {
    chamado: Cr2cd_chamados;
    visualizarChamado: (chamado: Cr2cd_chamados) => void;
    editarChamado: (chamado: Cr2cd_chamados) => void;
    excluirChamado: (chamado: Cr2cd_chamados) => void;
};

export default function MenuAcoesChamado({
    chamado, visualizarChamado, editarChamado, excluirChamado,
}: Props) {
    const [aberto, setAberto] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    const botao = useRef<HTMLButtonElement>(null);
    const podeAlterar = podeAlterarChamado(chamado);

    useEffect(() => {
        if (!aberto) return;
        function fecharFora(evento: PointerEvent) {
            if (!container.current?.contains(evento.target as Node)) setAberto(false);
        }
        document.addEventListener("pointerdown", fecharFora);
        return () => document.removeEventListener("pointerdown", fecharFora);
    }, [aberto]);

    function executar(acao: (chamado: Cr2cd_chamados) => void) {
        setAberto(false);
        acao(chamado);
    }

    return (
        <div ref={container} className="menu-acoes-chamado"
            onBlur={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false);
            }}
            onKeyDown={(evento) => {
                if (evento.key === "Escape") {
                    setAberto(false);
                    botao.current?.focus();
                }
            }}>
            <button ref={botao} type="button" className="menu-acoes-botao"
                aria-label={`Ações do chamado CH-${chamado.cr2cd_numero ?? ""}`}
                aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
                ⋯
            </button>
            {aberto && (
                <div className="menu-acoes-opcoes">
                    <button type="button" onClick={() => executar(visualizarChamado)}>
                        Ver detalhes
                    </button>
                    <button type="button" disabled={!podeAlterar} onClick={() => executar(editarChamado)}>
                        Editar
                    </button>
                    <button type="button" className="menu-acoes-excluir"
                        disabled={!podeAlterar} onClick={() => executar(excluirChamado)}>
                        Excluir
                    </button>
                    {!podeAlterar && <small>Somente chamados abertos podem ser alterados.</small>}
                </div>
            )}
        </div>
    );
}

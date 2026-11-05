// Limpa automaticamente a mensagem depois do tempo de exibição.
import { useEffect, useState } from "react";

// Compartilha a duração e a limpeza dos temporizadores entre criação e Dashboard.
export function useMensagemTemporaria() {
    const [mensagem, setMensagem] = useState("");
    // A cada nova mensagem, inicia um prazo de três segundos. A limpeza cancela o prazo anterior ao mudar a mensagem ou desmontar.
    useEffect(() => {
        if (!mensagem) return;
        const timer = window.setTimeout(() => setMensagem(""), 3000);
        return () => window.clearTimeout(timer);
    }, [mensagem]);
    return { mensagem, setMensagem };
}

import { useEffect, useState } from "react";

// Compartilha a duração e a limpeza dos temporizadores entre criação e Dashboard.
export function useMensagemTemporaria() {
    const [mensagem, setMensagem] = useState("");
    useEffect(() => {
        if (!mensagem) return;
        const timer = window.setTimeout(() => setMensagem(""), 3000);
        return () => window.clearTimeout(timer);
    }, [mensagem]);
    return { mensagem, setMensagem };
}

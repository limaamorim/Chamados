// Executa uma leitura assíncrona e ignora respostas de filtros/páginas que já mudaram.
import { useEffect, useState } from "react";

export function useLeituraChamados<T>(chave: string, carregar: () => Promise<T>, ativo = true, espera = 0) {
    const [resultado, setResultado] = useState<{ chave: string; dados?: T; erro?: string }>({ chave: "" });
    useEffect(() => {
        if (!ativo) return;
        let atual = true;
        // O pequeno atraso da listagem reúne digitação rápida e evita uma consulta por tecla.
        const timer = window.setTimeout(() => {
            void carregar().then(
                (dados) => { if (atual) setResultado({ chave, dados }); },
                (erro: unknown) => { if (atual) setResultado({ chave, erro: erro instanceof Error ? erro.message : "Não foi possível carregar os chamados." }); },
            );
        }, espera);
        return () => { atual = false; window.clearTimeout(timer); };
    }, [chave, carregar, ativo, espera]);
    const corresponde = resultado.chave === chave;
    return {
        dados: corresponde ? resultado.dados : undefined,
        erro: corresponde ? resultado.erro ?? "" : "",
        carregando: ativo && !corresponde,
    };
}

import { useEffect, useRef, useState } from "react";
import { criarChamado } from "../services/chamadosService";
import type { DadosChamado } from "../utils/chamados";

// A página cuida dos campos. O hook controla o processamento, os erros e as mensagens.
export function useCriarChamado() {
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const ativo = useRef(false);
    const emOperacao = useRef(false);
    useEffect(() => {
        ativo.current = true;
        return () => {
            ativo.current = false;
        };
    }, []);

    async function salvar(dados: DadosChamado) {
        if (emOperacao.current) return null;
        emOperacao.current = true;
        setSalvando(true);
        setErro("");
        try {
            // Mantém o solicitante fixo do protótipo; a integração com a conta é uma melhoria separada.
            const resultado = await criarChamado(dados, "José Amorim");
            // O modal entrega o aviso à página antes de fechar, sem perder a notificação.
            return resultado;
        } catch (error) {
            if (ativo.current)
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível criar o chamado."
                );
            return null;
        } finally {
            emOperacao.current = false;
            if (ativo.current) setSalvando(false);
        }
    }
    return { salvar, salvando, erro };
}

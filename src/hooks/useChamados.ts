import { useCallback, useEffect, useRef, useState } from "react";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import type { DadosChamado } from "../utils/chamados";
import {
    listarChamados,
    atualizarChamado,
    excluirChamado,
} from "../services/chamadosService";
import { useMensagemTemporaria } from "./useMensagemTemporaria";

// Controla os dados e as operações do Dashboard. Não decide quais modais estão abertos.
export function useChamados() {
    // Lista em memória: lembra uma coleção, mas useState não é Collect.
    // Cada uso deste hook tem seu próprio estado; ele não cria variáveis globais.
    const [chamados, setChamados] = useState<Cr2cd_chamados[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [erroOperacao, setErroOperacao] = useState("");
    const [operacao, setOperacao] = useState<"salvar" | "excluir" | null>(null);
    const { mensagem, setMensagem } = useMensagemTemporaria();
    const ativo = useRef(false);
    const emOperacao = useRef(false);
    const ultimaBusca = useRef(0);

    const carregar = useCallback(() => {
        // Ignora respostas antigas se uma nova consulta já tiver começado.
        const busca = ++ultimaBusca.current;
        return listarChamados()
            .then((dados) => {
                if (ativo.current && busca === ultimaBusca.current) {
                    // Substitui a lista inteira: aproximação de ClearCollect, não de Collect.
                    setChamados(dados);
                    setErro("");
                }
            })
            .catch((error: unknown) => {
                if (ativo.current && busca === ultimaBusca.current) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os chamados."
                    );
                }
            })
            .finally(() => {
                if (ativo.current && busca === ultimaBusca.current)
                    setCarregando(false);
            });
    }, []);

    useEffect(() => {
        ativo.current = true;
        void carregar();
        return () => {
            ativo.current = false;
        };
    }, [carregar]);

    async function salvar(chamado: Cr2cd_chamados, dados: DadosChamado) {
        if (emOperacao.current) return false;
        emOperacao.current = true;
        setOperacao("salvar");
        setErroOperacao("");
        setMensagem("");
        try {
            await atualizarChamado(chamado, dados);
            // Ideia de Refresh + ClearCollect: consulta novamente e substitui a lista local.
            await carregar();
            if (ativo.current) setMensagem("Chamado atualizado com sucesso!");
            return true;
        } catch (error) {
            if (ativo.current)
                setErroOperacao(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível atualizar o chamado."
                );
            return false;
        } finally {
            emOperacao.current = false;
            if (ativo.current) setOperacao(null);
        }
    }

    async function excluir(chamado: Cr2cd_chamados) {
        if (emOperacao.current) return false;
        emOperacao.current = true;
        setOperacao("excluir");
        setErroOperacao("");
        setMensagem("");
        try {
            await excluirChamado(chamado);
            await carregar();
            if (ativo.current) setMensagem("Chamado excluído com sucesso!");
            return true;
        } catch (error) {
            if (ativo.current)
                setErroOperacao(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível excluir o chamado."
                );
            return false;
        } finally {
            emOperacao.current = false;
            if (ativo.current) setOperacao(null);
        }
    }

    function recarregar() {
        // Lembra UpdateContext({carregando: true}): mostra o estado de carregamento.
        setCarregando(true);
        void carregar();
    }

    return {
        chamados,
        carregando,
        erro,
        erroOperacao,
        operacao,
        mensagem,
        salvar,
        excluir,
        recarregar,
        limparErroOperacao: () => setErroOperacao(""),
    };
}

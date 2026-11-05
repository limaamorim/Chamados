// Centraliza as operações e mensagens; cada tela consulta apenas os dados de que precisa.
import { useEffect, useRef, useState } from "react";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import type { DadosChamado } from "../utils/chamados";
import {
    invalidarConsultasChamados,
    atualizarChamado,
    excluirChamado,
} from "../services/chamadosService";
import { useMensagemTemporaria } from "./useMensagemTemporaria";

// Os modais usam estas operações; uma gravação invalida o cache de leitura.
export function useChamados() {
    // Uma nova versão invalida somente as consultas das telas que estão abertas.
    const [versao, setVersao] = useState(0);
    const [erroOperacao, setErroOperacao] = useState("");
    const [aviso, setAviso] = useState("");
    const [operacao, setOperacao] = useState<"salvar" | "excluir" | null>(null);
    const { mensagem, setMensagem } = useMensagemTemporaria();
    // As refs persistem entre renderizações sem redesenhar a tela e controlam montagem e operação em curso.
    const ativo = useRef(false);
    const emOperacao = useRef(false);

    useEffect(() => {
        ativo.current = true;
        return () => { ativo.current = false; };
    }, []);

    // Evita envios simultâneos, atualiza o Dataverse e recarrega a lista; devolve sucesso ou falha ao modal.
    async function salvar(chamado: Cr2cd_chamados, dados: DadosChamado) {
        if (emOperacao.current) return false;
        emOperacao.current = true;
        setOperacao("salvar");
        setErroOperacao("");
        setMensagem("");
        setAviso("");
        try {
            await atualizarChamado(chamado, dados);
            recarregar();
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

    // Executa a exclusão pelo service e atualiza a lista; erros ficam disponíveis para o modal.
    async function excluir(chamado: Cr2cd_chamados) {
        if (emOperacao.current) return false;
        emOperacao.current = true;
        setOperacao("excluir");
        setErroOperacao("");
        setMensagem("");
        setAviso("");
        try {
            await excluirChamado(chamado);
            recarregar();
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
        invalidarConsultasChamados();
        setVersao((atual) => atual + 1);
    }

    function aposCriar(avisoCriacao: string) {
        setMensagem("Chamado criado com sucesso!");
        setAviso(avisoCriacao);
        // Invalida indicadores e páginas para que a próxima consulta reflita a gravação.
        recarregar();
    }

    return {
        versao,
        erroOperacao,
        operacao,
        mensagem,
        aviso,
        aposCriar,
        salvar,
        excluir,
        recarregar,
        limparErroOperacao: () => setErroOperacao(""),
    };
}

// ReturnType aproveita o formato retornado pelo hook para tipar as props das páginas.
export type EstadoChamados = ReturnType<typeof useChamados>;

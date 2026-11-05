// Centraliza a lista de chamados, as operações de edição/exclusão e seus estados.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import type { DadosChamado } from "../utils/chamados";
import {
    listarChamados,
    atualizarChamado,
    excluirChamado,
} from "../services/chamadosService";
import { useMensagemTemporaria } from "./useMensagemTemporaria";
import { ordenarChamadosRecentes } from "../utils/resumoChamados";

// Lista compartilhada pelo Dashboard e pela página Chamados; os modais pertencem à interface.
export function useChamados() {
    // Os estados armazenam os registros e as informações que as telas usam para mostrar carregamento, erros e avisos.
    const [chamados, setChamados] = useState<Cr2cd_chamados[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [erroOperacao, setErroOperacao] = useState("");
    const [aviso, setAviso] = useState("");
    const [operacao, setOperacao] = useState<"salvar" | "excluir" | null>(null);
    const { mensagem, setMensagem } = useMensagemTemporaria();
    // As refs persistem entre renderizações sem redesenhar a tela: controlam montagem, operação em curso e ordem das buscas.
    const ativo = useRef(false);
    const emOperacao = useRef(false);
    const ultimaBusca = useRef(0);

    // useCallback mantém a mesma função entre renderizações; a consulta e seus resultados são tratados de forma assíncrona.
    const carregar = useCallback(() => {
        // Ignora respostas antigas se uma nova consulta já tiver começado.
        const busca = ++ultimaBusca.current;
        return listarChamados()
            .then((dados) => {
                if (ativo.current && busca === ultimaBusca.current) {
                    // Substitui a lista inteira: aproximação de ClearCollect, não de Collect.
                    setChamados(ordenarChamadosRecentes(dados));
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

    // Busca os dados ao montar. Ao desmontar, marca o hook como inativo para ignorar respostas que chegarem depois.
    useEffect(() => {
        ativo.current = true;
        void carregar();
        return () => {
            ativo.current = false;
        };
    }, [carregar]);

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
        setCarregando(true);
        void carregar();
    }

    function aposCriar(avisoCriacao: string) {
        setMensagem("Chamado criado com sucesso!");
        setAviso(avisoCriacao);
        // Busca novamente no Dataverse; cards, gráficos e tabelas recebem a mesma resposta.
        recarregar();
    }

    return {
        chamados,
        carregando,
        erro,
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

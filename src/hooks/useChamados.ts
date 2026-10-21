// Importa quatro recursos do React:
//
// useCallback: mantém a referência de uma função entre renderizações,
// enquanto suas dependências não mudarem.
//
// useEffect: executa uma ação após o componente aparecer
// e permite definir uma limpeza quando ele sair.
//
// useRef: guarda um valor entre renderizações.
// Alterar esse valor não atualiza a tela.
//
// useState: guarda um estado.
// Atualizar esse estado pode provocar uma atualização da tela.
import { useCallback, useEffect, useRef, useState } from "react";


// Importa o tipo que descreve um registro de chamado do Dataverse.
// É usado pelo TypeScript para conferir os campos do código.
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";


// Importa o tipo dos dados preenchidos no formulário:
// título, descrição, categoria e prioridade.
import type { DadosChamado } from "../utils/chamados";


// Importa as funções que conversam com os serviços do Dataverse.
import {
    listarChamados,    // Busca a lista de chamados.
    atualizarChamado,  // Atualiza os campos de um chamado.
    excluirChamado,    // Exclui um chamado.
} from "../services/chamadosService";


// Importa outro hook personalizado.
// Ele fornece a mensagem e uma função para atualizá-la.
// O controle de duração da mensagem fica nesse outro arquivo.
import { useMensagemTemporaria } from "./useMensagemTemporaria";


// Exporta o hook para que outros arquivos possam utilizá-lo.
// O Dashboard chama useChamados() para acessar seus dados e funções.
export function useChamados() {

    // Lista de chamados guardada na memória da interface.
    //
    // chamados: lista atual.
    // setChamados: função para atualizar a lista.
    // Cr2cd_chamados[]: indica uma lista de registros desse tipo.
    // []: começa com uma lista vazia.
    const [chamados, setChamados] = useState<Cr2cd_chamados[]>([]);


    // Indica se a lista está sendo carregada.
    // Começa como true porque a busca inicial ainda será feita.
    const [carregando, setCarregando] = useState(true);


    // Mensagem de erro relacionada à busca da lista.
    // Começa vazia: nenhum erro.
    const [erro, setErro] = useState("");


    // Mensagem de erro relacionada a salvar ou excluir.
    // É separada do erro de carregamento da lista.
    const [erroOperacao, setErroOperacao] = useState("");


    // Guarda qual operação está acontecendo.
    //
    // "salvar": existe um salvamento em andamento.
    // "excluir": existe uma exclusão em andamento.
    // null: nenhuma dessas operações está em andamento.
    const [operacao, setOperacao] =
        useState<"salvar" | "excluir" | null>(null);


    // Executa o hook de mensagem e retira dele:
    // mensagem: texto atual.
    // setMensagem: função que altera o texto.
    const { mensagem, setMensagem } = useMensagemTemporaria();


    // Marca se o componente que usa este hook está ativo.
    // O valor é acessado por ativo.current.
    const ativo = useRef(false);


    // Trava para impedir duas operações simultâneas de salvar/excluir.
    // Não precisa aparecer na tela, por isso usa useRef.
    const emOperacao = useRef(false);


    // Contador que identifica cada busca da lista.
    // Permite reconhecer qual foi a busca mais recente.
    const ultimaBusca = useRef(0);


    // Cria a função que busca os chamados.
    //
    // useCallback mantém a referência dessa função estável
    // enquanto suas dependências não mudarem.
    const carregar = useCallback(() => {

        // Aumenta o contador e guarda o novo número nesta execução.
        //
        // Primeira busca: busca = 1.
        // Segunda busca: busca = 2.
        //
        // Cada execução guarda seu próprio número em "busca".
        const busca = ++ultimaBusca.current;


        // Inicia a consulta.
        // O return permite que quem chamou carregar()
        // aguarde a conclusão usando await.
        return listarChamados()

            // Executado quando a consulta termina com sucesso.
            // "dados" contém a lista devolvida pelo serviço.
            .then((dados) => {

                // Só aplica a resposta se:
                // 1. O componente continua ativo.
                // 2. Esta ainda é a busca mais recente.
                if (ativo.current && busca === ultimaBusca.current) {

                    // Substitui a lista atual pelos registros recebidos.
                    // Aproxima-se de ClearCollect no Power Apps.
                    setChamados(dados);

                    // Limpa um possível erro de uma consulta anterior.
                    setErro("");
                }
            })

            // Executado se a consulta falhar.
            // unknown indica que ainda não sabemos o tipo do erro.
            .catch((error: unknown) => {

                // Não aplica erros de buscas antigas
                // nem de um componente que já saiu da tela.
                if (ativo.current && busca === ultimaBusca.current) {

                    setErro(
                        // Se for um objeto Error, aproveita sua mensagem.
                        error instanceof Error
                            ? error.message

                            // Caso contrário, usa uma mensagem padrão.
                            : "Não foi possível carregar os chamados."
                    );
                }
            })

            // Executado tanto após sucesso quanto após falha.
            .finally(() => {

                // Só a busca atual de um componente ativo
                // pode encerrar o indicador de carregamento.
                if (ativo.current && busca === ultimaBusca.current)
                    setCarregando(false);
            });

    // Lista de dependências vazia:
    // este callback não depende de valores reativos que mudam.
    // Isso não significa que carregar só pode ser executada uma vez.
    }, []);


    // Executa a preparação e a busca inicial após a montagem.
    // Também executa novamente se a referência de carregar mudar.
    useEffect(() => {

        // Marca que o componente está ativo.
        ativo.current = true;

        // Inicia a busca.
        //
        // void indica que não vamos usar o valor da Promise aqui.
        // Ele não cancela a função nem torna a chamada síncrona.
        void carregar();

        // Define a função de limpeza do efeito.
        // Ela roda quando o componente desmonta
        // ou antes de este efeito ser executado novamente.
        return () => {

            // Respostas futuras não devem mais atualizar este componente.
            ativo.current = false;
        };

    // carregar é uma dependência do efeito.
    }, [carregar]);


    // Atualiza um chamado existente.
    //
    // chamado: registro selecionado, com seu ID e demais campos.
    // dados: novos valores preenchidos no formulário.
    //
    // async permite usar await dentro da função.
    async function salvar(chamado: Cr2cd_chamados, dados: DadosChamado) {

        // Se já houver uma operação, interrompe esta tentativa.
        // return false informa que ela não foi concluída.
        if (emOperacao.current) return false;

        // Ativa a trava imediatamente.
        emOperacao.current = true;

        // Informa à interface que começou um salvamento.
        setOperacao("salvar");

        // Limpa o erro da operação anterior.
        setErroOperacao("");

        // Limpa a mensagem de sucesso anterior.
        setMensagem("");

        // Tenta executar as operações abaixo.
        try {

            // Solicita a atualização no Dataverse.
            // Aguarda essa atualização terminar.
            await atualizarChamado(chamado, dados);

            // Busca novamente a lista para refletir os dados salvos.
            await carregar();

            // Se o componente continua ativo, mostra o sucesso.
            if (ativo.current)
                setMensagem("Chamado atualizado com sucesso!");

            // Informa ao código que chamou salvar()
            // que a atualização terminou com sucesso.
            return true;

        // Se a atualização lançar um erro, entra aqui.
        } catch (error) {

            // Só atualiza a mensagem se o componente estiver ativo.
            if (ativo.current)
                setErroOperacao(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível atualizar o chamado."
                );

            // Informa que a operação falhou.
            return false;

        // Executa mesmo quando houve erro ou return no try/catch.
        } finally {

            // Libera a trava para uma próxima operação.
            emOperacao.current = false;

            // Informa à interface que o salvamento terminou.
            if (ativo.current) setOperacao(null);
        }
    }


    // Exclui o chamado recebido.
    async function excluir(chamado: Cr2cd_chamados) {

        // Impede outra operação simultânea.
        if (emOperacao.current) return false;

        // Ativa a trava.
        emOperacao.current = true;

        // Informa à interface que está excluindo.
        setOperacao("excluir");

        // Limpa mensagens anteriores.
        setErroOperacao("");
        setMensagem("");

        try {

            // Solicita a exclusão no Dataverse e aguarda.
            await excluirChamado(chamado);

            // Busca novamente os registros.
            // A lista atualizada deve vir sem o chamado excluído.
            await carregar();

            // Mostra sucesso se o componente ainda estiver ativo.
            if (ativo.current)
                setMensagem("Chamado excluído com sucesso!");

            // Informa sucesso para quem chamou esta função.
            return true;

        } catch (error) {

            // Mostra o erro de exclusão.
            if (ativo.current)
                setErroOperacao(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível excluir o chamado."
                );

            // Informa falha.
            return false;

        } finally {

            // Libera uma próxima operação.
            emOperacao.current = false;

            // Remove o estado de exclusão em andamento.
            if (ativo.current) setOperacao(null);
        }
    }


    // Função usada pelo botão de tentar carregar novamente.
    function recarregar() {

        // Faz a interface mostrar o indicador de carregamento.
        setCarregando(true);

        // Inicia uma nova busca.
        // carregar() desligará o indicador ao terminar.
        void carregar();
    }


    // Entrega os dados e as funções para quem usa este hook.
    // É esse objeto que o Dashboard recebe ao chamar useChamados().
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

        // Entrega uma função com este nome.
        // Quando chamada, limpa o erro de salvar/excluir.
        limparErroOperacao: () => setErroOperacao(""),
    };
}
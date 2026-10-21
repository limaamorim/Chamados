// Recurso do React para guardar informações que podem mudar.
// Neste arquivo, será usado para lembrar qual janela está aberta.
import { useState } from "react";

// Estrutura visual da página.
// Recebe título, descrição, mensagem, erro e o conteúdo da página.
import Pagina from "../../components/layout/Pagina";

// Componente de botão reutilizável.
// Aqui é usado no botão "Tentar carregar novamente".
import Button from "../../components/ui/Button";

// Componente que desenha um card de indicador.
// O mesmo componente é usado para Abertos, Em andamento,
// Resolvidos e Total, recebendo valores diferentes.
import KpiCard from "./components/KpiCard";

// Componente que mostra a tabela de chamados.
import ChamadosTable from "./components/ChamadosTable";

// Janela que mostra os detalhes de um chamado.
import DetalhesChamadoModal from "./components/DetalhesChamadoModal";

// Janela com o formulário de edição de um chamado.
import EditarChamadoModal from "./components/EditarChamadoModal";

// Janela que pede confirmação antes de excluir um chamado.
import ExcluirChamadoModal from "./components/ExcluirChamadoModal";

// Hook personalizado: reúne os dados e as operações dos chamados.
// Ele fornece a lista, os estados de carregamento,
// as mensagens e as funções de salvar, excluir e recarregar.
import { useChamados } from "../../hooks/useChamados";

// Função auxiliar que verifica se o chamado pode ser alterado.
// Na regra atual, retorna true quando o chamado está aberto.
import { podeAlterarChamado } from "../../utils/chamados";

// Tipo do TypeScript que descreve os campos de um chamado.
// Serve para verificar o código durante o desenvolvimento.
// Não busca dados no Dataverse.
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";

// Importa os estilos visuais desta página.
import "./Dashboard.css";


// Define quais propriedades o Dashboard precisa receber.
type DashboardProps = {
    // Deve receber uma função que abre a página de novo chamado.
    // () significa que ela não recebe argumentos.
    // void significa que não precisamos de um valor de retorno.
    abrirNovoChamado: () => void;
};


// Define o formato da informação sobre a janela aberta.
type ModalAtivo = {
    // Só permite um destes três textos.
    tipo: "detalhes" | "editar" | "excluir";

    // Guarda o chamado que será mostrado, editado ou excluído.
    chamado: Cr2cd_chamados;
};


// Cria o componente Dashboard e permite importá-lo em outro arquivo.
//
// { abrirNovoChamado } retira essa função das propriedades recebidas.
// DashboardProps verifica se as propriedades têm o formato esperado.
export default function Dashboard({ abrirNovoChamado }: DashboardProps) {

    // Executa o hook useChamados.
    //
    // O hook devolve um objeto. As chaves abaixo retiram desse
    // objeto os valores e funções que esta página vai utilizar.
    const {
        chamados,           // Lista de chamados carregados.
        carregando,         // Indica se a busca está em andamento.
        erro,               // Erro ao carregar a lista.
        erroOperacao,       // Erro ao salvar ou excluir.
        operacao,           // Indica a operação atual: salvar, excluir ou nenhuma.
        mensagem,           // Mensagem de sucesso para mostrar na página.
        salvar,             // Função que atualiza um chamado.
        excluir,            // Função que exclui um chamado.
        recarregar,         // Função que busca a lista novamente.
        limparErroOperacao, // Função que limpa o erro de salvar/excluir.
    } = useChamados();


    // Guarda qual janela está aberta e qual chamado foi selecionado.
    //
    // modal: valor atual.
    // setModal: função para atualizar esse valor.
    //
    // ModalAtivo | null:
    // pode guardar um objeto ModalAtivo ou null.
    //
    // O valor inicial é null: nenhuma janela aberta.
    const [modal, setModal] = useState<ModalAtivo | null>(null);


    // Função chamada quando a pessoa quer visualizar,
    // editar ou excluir um chamado.
    //
    // ModalAtivo["tipo"] reaproveita as opções definidas no tipo:
    // "detalhes", "editar" ou "excluir".
    function abrirModal(tipo: ModalAtivo["tipo"], chamado: Cr2cd_chamados) {

        // Limpa um erro anterior para ele não aparecer
        // ao abrir uma nova janela.
        limparErroOperacao();

        // Guarda o tipo da janela e o chamado selecionado.
        // A mudança de estado faz o React atualizar a interface.
        setModal({ tipo, chamado });
    }


    // Seleciona os chamados que passam na regra de "pode alterar".
    // Como a regra atual permite alterar somente chamados abertos,
    // o resultado é a lista de chamados abertos.
    // .length conta quantos existem.
    const abertos = chamados.filter(podeAlterarChamado).length;


    // Seleciona os chamados com o código de status "Em andamento".
    // Depois conta os registros selecionados.
    const emAndamento = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180001
    ).length;


    // Seleciona os chamados com o código de status "Resolvido".
    // Depois conta os registros selecionados.
    const resolvidos = chamados.filter(
        (chamado) => chamado.cr2cd_status === 997180002
    ).length;


    // A partir daqui, define o que será exibido na tela.
    // Essa sintaxe parecida com HTML se chama JSX.
    return (
        <Pagina
            titulo="Meus chamados"
            descricao="Gerencie e acompanhe suas solicitações."
            mensagem={mensagem}
            erro={erro}
        >
            {/* Agrupa os quatro cards.
                className conecta o elemento aos estilos CSS. */}
            <div className="kpis">

                {/* Reutiliza KpiCard passando os dados de Abertos. */}
                <KpiCard
                    titulo="Abertos"
                    valor={abertos}
                    icone="▣"
                    cor="azul"
                />

                {/* Mesmo componente, com outros dados. */}
                <KpiCard
                    titulo="Em andamento"
                    valor={emAndamento}
                    icone="◷"
                    cor="laranja"
                />

                <KpiCard
                    titulo="Resolvidos"
                    valor={resolvidos}
                    icone="✓"
                    cor="verde"
                />

                {/* Conta todos os chamados da lista carregada. */}
                <KpiCard
                    titulo="Total"
                    valor={chamados.length}
                    icone="Σ"
                    cor="roxo"
                />
            </div>


            {/* Se carregando for true, mostra o aviso.
                role="status" ajuda tecnologias de acessibilidade
                a identificar essa mensagem de estado. */}
            {carregando && <p role="status">Carregando chamados...</p>}


            {/* Se houver um texto de erro, mostra o botão de tentar novamente. */}
            {erro && (
                <Button
                    variante="secundario"

                    // Entrega a função ao botão.
                    // Ela será executada quando houver um clique.
                    onClick={recarregar}

                    // Desativa o botão enquanto estiver carregando.
                    disabled={carregando}
                >
                    Tentar carregar novamente
                </Button>
            )}


            {/* Mostra a tabela somente quando:
                NÃO está carregando E NÃO existe erro. */}
            {!carregando && !erro && (
                <ChamadosTable

                    // Entrega a lista para a tabela mostrar.
                    chamados={chamados}

                    // Entrega a função que abre a página de novo chamado.
                    abrirNovoChamado={abrirNovoChamado}

                    // A tabela informa qual chamado foi clicado.
                    // O Dashboard abre a janela de detalhes desse chamado.
                    visualizarChamado={(chamado) =>
                        abrirModal("detalhes", chamado)
                    }

                    // Abre a janela de edição do chamado selecionado.
                    editarChamado={(chamado) => abrirModal("editar", chamado)}

                    // Abre a confirmação de exclusão.
                    // Aqui ainda não exclui o registro.
                    excluirChamado={(chamado) => abrirModal("excluir", chamado)}
                />
            )}


            {/* Se a janela escolhida for "detalhes", mostra este componente.
                ?. permite consultar tipo mesmo quando modal é null. */}
            {modal?.tipo === "detalhes" && (
                <DetalhesChamadoModal

                    // Entrega o chamado selecionado para a janela.
                    chamado={modal.chamado}

                    // Ao fechar, limpa o estado: nenhuma janela aberta.
                    fechar={() => setModal(null)}
                />
            )}


            {/* Mostra o formulário somente se a janela escolhida for "editar". */}
            {modal?.tipo === "editar" && (
                <EditarChamadoModal

                    // Identifica o formulário pelo ID do chamado.
                    // Se esse ID mudar, o React cria uma nova instância
                    // do componente, reiniciando seu estado interno.
                    key={modal.chamado.cr2cd_chamadoid}

                    // Entrega o registro que será editado.
                    chamado={modal.chamado}

                    // Entrega eventual erro da operação.
                    erro={erroOperacao}

                    // A comparação produz true ou false.
                    // Informa se existe um salvamento em andamento.
                    salvando={operacao === "salvar"}

                    // Função para fechar a janela.
                    fechar={() => setModal(null)}

                    // O formulário entrega os novos dados.
                    // Chamamos a função salvar do hook passando:
                    // 1. O chamado selecionado.
                    // 2. Os dados preenchidos no formulário.
                    salvar={(dados) => salvar(modal.chamado, dados)}
                />
            )}


            {/* Mostra a confirmação somente se a janela for "excluir". */}
            {modal?.tipo === "excluir" && (
                <ExcluirChamadoModal

                    // Entrega o chamado que pode ser excluído.
                    chamado={modal.chamado}

                    // Entrega eventual erro da exclusão.
                    erro={erroOperacao}

                    // Informa se a exclusão está em andamento.
                    excluindo={operacao === "excluir"}

                    // Fecha a janela sem pedir exclusão.
                    fechar={() => setModal(null)}

                    // Quando a janela chamar confirmar,
                    // executa a exclusão do chamado selecionado.
                    confirmar={() => excluir(modal.chamado)}
                />
            )}
        </Pagina>
    );
}
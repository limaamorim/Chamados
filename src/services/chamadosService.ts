import { Cr2cd_chamadosService } from "../generated/services/Cr2cd_chamadosService";
import { FLW_NotificarNovoChamadoService } from "../generated/services/FLW_NotificarNovoChamadoService";
import type { Cr2cd_chamados, Cr2cd_chamadosBase } from "../generated/models/Cr2cd_chamadosModel";
import {
    obterCategoria,
    obterPrioridade,
    obterProximoStatus,
    podeAlterarChamado,
    STATUS_ABERTO,
    validarCamposChamado,
} from "../utils/chamados";
import type { DadosChamado } from "../utils/chamados";

// As páginas chamam estas funções. Somente este arquivo conversa com os serviços gerados.
// Não editamos generated/: seus arquivos podem ser recriados pela CLI do Power Apps.
export async function listarChamados() {
    // orderBy → ideia de SortByColumns (ou Sort): ordena por createdon, decrescente.
    // A ordenação ocorre no Dataverse; não existe sort() local neste projeto.
    const resultado = await Cr2cd_chamadosService.getAll({ orderBy: ["createdon desc"] });
    if (!resultado.success || !resultado.data) {
        throw new Error(resultado.error?.message ?? "Não foi possível carregar os chamados.");
    }
    return resultado.data;
}

export async function criarChamado(dados: DadosChamado, solicitante: string) {
    const erro = validarCamposChamado(dados.titulo, dados.descricao);
    if (erro) throw new Error(erro);

    // Converte os nomes do formulário para os nomes das colunas do Dataverse.
    const registro: Omit<Cr2cd_chamadosBase, "cr2cd_chamadoid"> = {
        cr2cd_titulo: dados.titulo.trim(),
        cr2cd_descricao: dados.descricao.trim(),
        cr2cd_categoria: dados.categoria,
        cr2cd_prioridade: dados.prioridade,
        cr2cd_status: STATUS_ABERTO,
        cr2cd_solicitante: solicitante,
        cr2cd_datadeabertura: new Date().toISOString(),
        statecode: 0,
    };

    // create() → Patch(Fonte, Defaults(Fonte), registro): cria um registro no Dataverse.
    // Não é Collect de uma coleção local; await espera a resposta antes de continuar.
    const resultado = await Cr2cd_chamadosService.create(registro);
    if (!resultado.success) {
        throw new Error(resultado.error?.message ?? "Não foi possível criar o chamado.");
    }

    // O fluxo só é chamado depois da confirmação da gravação.
    // Se a notificação falhar, o chamado continua criado: devolvemos um aviso para evitar duplicação.
    try {
        const fluxo = await FLW_NotificarNovoChamadoService.Run({
            text: dados.titulo.trim(),
            text_1: dados.descricao.trim(),
            text_2: obterCategoria(registro),
            text_4: obterPrioridade(registro),
        });
        if (!fluxo.success) throw new Error("Falha ao acionar a notificação.");
        return { aviso: "" };
    } catch (error) {
        console.error("Chamado criado, mas houve falha ao acionar a notificação:", error);
        return { aviso: "Chamado criado, mas não foi possível acionar a notificação por e-mail." };
    }
}

export async function atualizarChamado(chamado: Cr2cd_chamados, dados: DadosChamado) {
    if (!podeAlterarChamado(await consultarChamadoAtual(chamado))) throw new Error("Somente chamados abertos podem ser editados.");
    const erro = validarCamposChamado(dados.titulo, dados.descricao);
    if (erro) throw new Error(erro);

    // update() → Patch: usa o ID para alterar apenas os campos enviados.
    // O ID vem da linha selecionada; consultarChamadoAtual usa get(id), ideia de LookUp, para validar o status.
    const resultado = await Cr2cd_chamadosService.update(chamado.cr2cd_chamadoid, {
        cr2cd_titulo: dados.titulo.trim(),
        cr2cd_descricao: dados.descricao.trim(),
        cr2cd_categoria: dados.categoria,
        cr2cd_prioridade: dados.prioridade,
    });
    if (!resultado.success) {
        throw new Error(resultado.error?.message ?? "Não foi possível atualizar o chamado.");
    }
}

export async function excluirChamado(chamado: Cr2cd_chamados) {
    if (!podeAlterarChamado(await consultarChamadoAtual(chamado))) throw new Error("Somente chamados abertos podem ser excluídos.");

    // delete() → Remove: apaga do Dataverse o registro identificado pelo ID.
    // O hook useChamados recarrega a lista depois; esconder uma linha não seria excluir.
    await Cr2cd_chamadosService.delete(chamado.cr2cd_chamadoid);
}

// Reconsulta antes da operação: o status pode ter mudado desde que a tabela foi carregada.
// As permissões de acesso continuam sendo responsabilidade do Dataverse.
async function consultarChamadoAtual(chamado: Cr2cd_chamados) {
    const resultado = await Cr2cd_chamadosService.get(chamado.cr2cd_chamadoid);
    if (!resultado.success || !resultado.data) {
        throw new Error(resultado.error?.message ?? "Não foi possível consultar o chamado atual.");
    }
    return resultado.data;
}

export async function avancarStatusChamado(chamado: Cr2cd_chamados) {
    const atual = await consultarChamadoAtual(chamado);
    if (atual.cr2cd_status !== chamado.cr2cd_status) {
        throw new Error("O status deste chamado mudou. Atualize a lista antes de continuar.");
    }
    const proximoStatus = obterProximoStatus(atual);
    if (proximoStatus === null) throw new Error("Este chamado não permite avançar o status.");

    // update() → Patch: altera somente o status, preservando os demais campos.
    const resultado = await Cr2cd_chamadosService.update(chamado.cr2cd_chamadoid, {
        cr2cd_status: proximoStatus,
    });
    if (!resultado.success) {
        throw new Error(resultado.error?.message ?? "Não foi possível alterar o status.");
    }
}

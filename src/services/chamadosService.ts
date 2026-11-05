// Executa consultas e gravações no Dataverse e aciona o fluxo de notificação.

import { Cr2cd_chamadosService } from "../generated/services/Cr2cd_chamadosService";
import { FLW_NotificarNovoChamadoService } from "../generated/services/FLW_NotificarNovoChamadoService";
import type { Cr2cd_chamados, Cr2cd_chamadosBase } from "../generated/models/Cr2cd_chamadosModel";
import {
    obterCategoria,
    obterPrioridade,
    podeExcluirChamado,
    STATUS_ABERTO,
    validarCamposChamado,
} from "../utils/chamados";
import type { DadosChamado } from "../utils/chamados";

// As páginas chamam estas funções. Somente este arquivo conversa com os serviços gerados.
// Não editamos generated/: seus arquivos podem ser recriados pela CLI do Power Apps.
export async function listarChamados(): Promise<Cr2cd_chamados[]> {
    // Acumula os chamados de todas as páginas.
    const todosChamados: Cr2cd_chamados[] = [];

    // A primeira consulta não precisa de token.
    let skipToken: string | undefined;

    do {
        // await espera uma página do Dataverse; maxPageSize limita cada resposta, não o total da lista.
        const resultado = await Cr2cd_chamadosService.getAll({
            // O ID desempata registros com a mesma data.
            orderBy: ["createdon desc", "cr2cd_chamadoid asc"],
            maxPageSize: 500,
            skipToken,
        });

        if (!resultado.success || !resultado.data) {
            throw new Error(
                resultado.error?.message ??
                "Não foi possível carregar os chamados."
            );
        }

        // Adiciona os registros desta página à lista.
        todosChamados.push(...resultado.data);

        // Se houver token, o laço buscará a próxima página.
        skipToken = resultado.skipToken || undefined;
    } while (skipToken);

    return todosChamados;
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

// Valida o rascunho e envia somente os campos editáveis, identificando o registro pelo ID.
export async function atualizarChamado(chamado: Cr2cd_chamados, dados: DadosChamado) {
    const erro = validarCamposChamado(dados.titulo, dados.descricao);
    if (erro) throw new Error(erro);

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

// Confere a regra de status antes de pedir ao serviço gerado que exclua o registro.
export async function excluirChamado(chamado: Cr2cd_chamados) {
    if (!podeExcluirChamado(chamado)) throw new Error("Somente chamados abertos podem ser excluídos.");

    await Cr2cd_chamadosService.delete(chamado.cr2cd_chamadoid);
}

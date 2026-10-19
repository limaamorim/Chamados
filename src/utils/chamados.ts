import {
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_prioridade,
    Cr2cd_chamadoscr2cd_status,
} from "../generated/models/Cr2cd_chamadosModel";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";

// Funções e valores compartilhados. Este arquivo não acessa o Dataverse nem usa React.
export const STATUS_ABERTO = 997180000;
export const CATEGORIA_PADRAO: Cr2cd_chamadoscr2cd_categoria = 997180000;
export const PRIORIDADE_PADRAO: Cr2cd_chamadoscr2cd_prioridade = 997180000;

export type DadosChamado = {
    titulo: string;
    descricao: string;
    categoria: Cr2cd_chamadoscr2cd_categoria;
    prioridade: Cr2cd_chamadoscr2cd_prioridade;
};

// Os mapas gerados têm código numérico -> nome. Aproveitamos esses nomes nos dois formulários.
export const categoriasChamado = Object.entries(
    Cr2cd_chamadoscr2cd_categoria
).map(([codigo, nome]) => ({
    codigo: Number(codigo) as Cr2cd_chamadoscr2cd_categoria,
    nome,
}));

export const prioridadesChamado = Object.entries(
    Cr2cd_chamadoscr2cd_prioridade
).map(([codigo, nome]) => ({
    codigo: Number(codigo) as Cr2cd_chamadoscr2cd_prioridade,
    nome,
}));

export function obterCategoria(
    chamado: Pick<Cr2cd_chamados, "cr2cd_categoria">
) {
    if (chamado.cr2cd_categoria === undefined) return "-";
    return Cr2cd_chamadoscr2cd_categoria[chamado.cr2cd_categoria] ?? "-";
}

export function obterPrioridade(
    chamado: Pick<Cr2cd_chamados, "cr2cd_prioridade">
) {
    if (chamado.cr2cd_prioridade === undefined) return "-";
    return Cr2cd_chamadoscr2cd_prioridade[chamado.cr2cd_prioridade] ?? "-";
}

export function obterStatus(chamado: Pick<Cr2cd_chamados, "cr2cd_status">) {
    if (chamado.cr2cd_status === undefined) return "-";
    return Cr2cd_chamadoscr2cd_status[chamado.cr2cd_status] ?? "-";
}

// A regra usa o código do status; o texto traduzido serve apenas para exibição.
export function podeAlterarChamado(
    chamado: Pick<Cr2cd_chamados, "cr2cd_status">
) {
    return chamado.cr2cd_status === STATUS_ABERTO;
}

export function validarCamposChamado(titulo: string, descricao: string) {
    if (!titulo.trim() || !descricao.trim())
        return "Preencha o título e a descrição.";
    return "";
}

// Cria um rascunho independente do registro: editar campos não altera a lista antes de salvar.
export function criarDadosFormulario(chamado?: Cr2cd_chamados): DadosChamado {
    return {
        titulo: chamado?.cr2cd_titulo ?? "",
        descricao: chamado?.cr2cd_descricao ?? "",
        categoria: chamado?.cr2cd_categoria ?? CATEGORIA_PADRAO,
        prioridade: chamado?.cr2cd_prioridade ?? PRIORIDADE_PADRAO,
    };
}

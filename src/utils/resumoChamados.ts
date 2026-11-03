import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";

export type GrupoChamados = { nome: string; total: number };

// Mantém também as opções sem registros e inclui valores ausentes/desconhecidos na contagem.
export function agruparChamados(
    chamados: Cr2cd_chamados[],
    campo: "cr2cd_categoria" | "cr2cd_status",
    opcoes: Record<number, string>,
): GrupoChamados[] {
    const grupos = new Map<string, GrupoChamados>(
        Object.entries(opcoes).map(([codigo, nome]) => [codigo, { nome, total: 0 }]),
    );
    for (const chamado of chamados) {
        const codigo = chamado[campo];
        const chave = codigo !== undefined && grupos.has(String(codigo))
            ? String(codigo)
            : "nao-informado";
        if (!grupos.has(chave)) grupos.set(chave, { nome: "Não informado", total: 0 });
        grupos.get(chave)!.total += 1;
    }
    return Array.from(grupos.values());
}

function dataCadastro(chamado: Cr2cd_chamados) {
    const data = Date.parse(chamado.createdon ?? "");
    return Number.isNaN(data) ? 0 : data;
}

// Ordena uma cópia; não altera a lista compartilhada ao preparar os cinco mais recentes.
export function ordenarChamadosRecentes(chamados: Cr2cd_chamados[]) {
    return [...chamados].sort((a, b) => dataCadastro(b) - dataCadastro(a));
}

export function obterUltimosChamados(chamados: Cr2cd_chamados[]) {
    return ordenarChamadosRecentes(chamados).slice(0, 5);
}

import { BaseConhecimento_2Service } from "../generated/services/BaseConhecimento_2Service";
import type { BaseConhecimento_2Read } from "../generated/models/BaseConhecimento_2Model";
import type { Artigo } from "../types/baseConhecimento";

// O SharePoint pode devolver Conteudo como texto simples ou texto com formatação.
function obterParagrafos(conteudo: string) {
    const documento = new DOMParser().parseFromString(conteudo, "text/html");
    documento.querySelectorAll("br").forEach((elemento) => elemento.replaceWith("\n"));
    documento.querySelectorAll("p, div, li, h1, h2, h3").forEach((elemento) => elemento.append("\n"));
    return (documento.body.textContent ?? "").split(/\r?\n/).map((texto) => texto.trim()).filter(Boolean);
}

function converterArtigo(item: BaseConhecimento_2Read): Artigo {
    const conteudo = obterParagrafos(item.field_3 ?? "");
    return {
        id: item.ID!,
        titulo: item.Title || "Sem título",
        categoria: item.field_2?.Value || "Sem categoria",
        descricao: (conteudo[0] ?? "").slice(0, 160),
        conteudo,
        icone: "▤",
        tempoLeitura: item.field_4 ?? 0,
    };
}

export async function listarArtigos(): Promise<Artigo[]> {
    const resultado = await BaseConhecimento_2Service.getAll();
    if (!resultado.success || !resultado.data) {
        throw new Error(resultado.error?.message ?? "Não foi possível carregar os artigos.");
    }
    return resultado.data.filter((item) => item.ID !== undefined && !item["{IsFolder}"]).map(converterArtigo);
}

import { BaseConhecimentoService } from "../generated/services/BaseConhecimentoService";
import type { BaseConhecimentoRead } from "../generated/models/BaseConhecimentoModel";
import type { Artigo } from "../data/baseConhecimento";

// O SharePoint pode devolver Conteudo como texto simples ou texto com formatação.
function obterParagrafos(conteudo: string) {
    const documento = new DOMParser().parseFromString(conteudo, "text/html");
    documento.querySelectorAll("br").forEach((elemento) => elemento.replaceWith("\n"));
    documento.querySelectorAll("p, div, li, h1, h2, h3").forEach((elemento) => elemento.append("\n"));
    // split → Split; map aplica trim (TrimEnds) a cada trecho; filter(Boolean) tira vazios.
    return (documento.body.textContent ?? "").split(/\r?\n/).map((texto) => texto.trim()).filter(Boolean);
}

function converterArtigo(item: BaseConhecimentoRead): Artigo {
    const conteudo = obterParagrafos(item.Conteudo ?? "");
    return {
        id: item.ID!,
        titulo: item.Title || "Sem título",
        categoria: item.Categoria?.Value || "Sem categoria",
        descricao: (conteudo[0] ?? "").slice(0, 160),
        conteudo,
        icone: "▤",
        tempoLeitura: item.Minutos ?? 0,
    };
}

export async function listarArtigos(): Promise<Artigo[]> {
    const resultado = await BaseConhecimentoService.getAll();
    if (!resultado.success || !resultado.data) {
        throw new Error(resultado.error?.message ?? "Não foi possível carregar os artigos.");
    }
    // filter → Filter: descarta pastas e itens sem ID antes de montar os artigos da tela.
    // map converte cada registro para Artigo; só transforma dados, não salva no SharePoint.
    return resultado.data.filter((item) => item.ID !== undefined && !item["{IsFolder}"]).map(converterArtigo);
}

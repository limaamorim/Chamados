import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import { Cr2cd_chamadoscr2cd_status } from "../generated/models/Cr2cd_chamadosModel";
import type { FiltrosChamados } from "./filtrosChamados";
import { validarPeriodoDatas } from "./filtrosChamados";
import { obterCategoria, obterPrioridade, obterStatus } from "./chamados";

function dataFiltro(valor: string) {
    return valor ? valor.split("-").reverse().join("/") : "Sem limite";
}

function dataCadastro(valor?: string) {
    const data = new Date(valor ?? "");
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleDateString("pt-BR");
}

// Helvetica atende aos acentos do português; símbolos sem glifo são substituídos para não impedir o download.
function textoCompativel(texto: string, fonte: PDFFont) {
    return Array.from(texto).map((caractere) => {
        if (caractere === "\n") return caractere;
        if (/\s/.test(caractere)) return " ";
        try {
            fonte.encodeText(caractere);
            return caractere;
        } catch {
            return "?";
        }
    }).join("");
}

// Quebra também palavras longas, evitando texto sobreposto entre as colunas.
function quebrarLinhas(texto: string, largura: number, fonte: PDFFont, tamanho: number) {
    const linhas: string[] = [];
    for (const paragrafo of textoCompativel(texto, fonte).split("\n")) {
        let linha = "";
        for (const palavra of paragrafo.split(/\s+/)) {
            const candidato = linha ? linha + " " + palavra : palavra;
            if (fonte.widthOfTextAtSize(candidato, tamanho) <= largura) {
                linha = candidato;
                continue;
            }
            if (linha) linhas.push(linha);
            linha = "";
            for (const caractere of palavra) {
                if (fonte.widthOfTextAtSize(linha + caractere, tamanho) > largura && linha) {
                    linhas.push(linha);
                    linha = "";
                }
                linha += caractere;
            }
        }
        linhas.push(linha || " ");
    }
    return linhas;
}

// Recebe a mesma lista exibida pela tabela. A geração não consulta nem altera o Dataverse.
export async function criarPdfChamados(chamados: Cr2cd_chamados[], filtros: FiltrosChamados) {
    const erro = validarPeriodoDatas(filtros.dataInicial, filtros.dataFinal);
    if (erro) throw new Error(erro);
    const pdf = await PDFDocument.create();
    const fonte = await pdf.embedFont(StandardFonts.Helvetica);
    const negrito = await pdf.embedFont(StandardFonts.HelveticaBold);
    const emitido = new Date();
    pdf.setTitle("Caze - Relatório de chamados");
    pdf.setAuthor("Caze");
    pdf.setCreationDate(emitido);

    const azul = rgb(0.03, 0.49, 0.85);
    const escuro = rgb(0.15, 0.2, 0.3);
    const cinza = rgb(0.4, 0.46, 0.54);
    const claro = rgb(0.95, 0.97, 0.99);
    const borda = rgb(0.86, 0.9, 0.93);
    const larguras = [72, 276, 98, 76, 115, 125];
    const titulos = ["Número", "Título", "Categoria", "Prioridade", "Status", "Cadastro"];
    const margem = 40;
    let pagina = pdf.addPage([842, 595]);
    let y = 0;

    function cabecalho() {
        pagina.drawRectangle({ x: margem, y: 555, width: 4, height: 24, color: azul });
        pagina.drawText("Caze | Relatório de chamados", {
            x: margem + 14, y: 559, size: 20, font: negrito, color: escuro,
        });
        pagina.drawText("Listagem de solicitações - dados filtrados", {
            x: margem + 14, y: 541, size: 10, font: fonte, color: cinza,
        });
        pagina.drawText("Emitido em: " + emitido.toLocaleString("pt-BR"), {
            x: margem, y: 517, size: 9, font: fonte, color: cinza,
        });
        pagina.drawLine({ start: { x: margem, y: 506 }, end: { x: 802, y: 506 }, color: borda });
        y = 486;
    }

    function novaPagina() {
        pagina = pdf.addPage([842, 595]);
        cabecalho();
    }

    function cabecalhoTabela() {
        if (y < 90) novaPagina();
        pagina.drawRectangle({ x: margem, y: y - 26, width: 762, height: 26, color: azul });
        let x = margem;
        titulos.forEach((titulo, indice) => {
            pagina.drawText(titulo, { x: x + 8, y: y - 17, size: 9, font: negrito, color: rgb(1, 1, 1) });
            x += larguras[indice];
        });
        y -= 26;
    }

    cabecalho();
    pagina.drawText("FILTROS APLICADOS", { x: margem, y, size: 10, font: negrito, color: escuro });
    y -= 16;
    const status = filtros.status === "todos" ? "Todos os status"
        : Cr2cd_chamadoscr2cd_status[Number(filtros.status) as Cr2cd_chamadoscr2cd_status] ?? "Não informado";
    const criterios = [
        ["Pesquisa", filtros.pesquisa || "Sem pesquisa"],
        ["Status", status],
        ["Data inicial", dataFiltro(filtros.dataInicial)],
        ["Data final", dataFiltro(filtros.dataFinal)],
        ["Critério de data", "Data de cadastro (createdon), no horário local; limites inclusivos"],
        ["Registros", String(chamados.length)],
    ];
    for (const [rotulo, valor] of criterios) {
        const linhas = quebrarLinhas(valor, 624, fonte, 9);
        let deslocamento = 0;
        // Permite pesquisas extensas sem cortar os filtros do cabeçalho.
        while (deslocamento < linhas.length) {
            if (y < 90) novaPagina();
            const quantidade = Math.min(linhas.length - deslocamento, Math.floor((y - 60) / 12) - 1);
            const altura = quantidade * 12 + 10;
            pagina.drawRectangle({ x: margem, y: y - altura, width: 762, height: altura, color: claro });
            pagina.drawText(rotulo + (deslocamento ? " (cont.)" : ""), {
                x: margem + 9, y: y - 13, size: 9, font: negrito, color: escuro,
            });
            linhas.slice(deslocamento, deslocamento + quantidade).forEach((linha, indice) => {
                pagina.drawText(linha, { x: 169, y: y - 13 - indice * 12, size: 9, font: fonte, color: escuro });
            });
            y -= altura;
            deslocamento += quantidade;
        }
    }
    y -= 20;
    cabecalhoTabela();

    if (!chamados.length) {
        pagina.drawText("Nenhum chamado encontrado para os filtros selecionados.", {
            x: margem + 8, y: y - 22, size: 10, font: fonte, color: cinza,
        });
    }
    for (const [indiceRegistro, chamado] of chamados.entries()) {
        const valores = [
            "CH-" + (chamado.cr2cd_numero ?? "-"),
            chamado.cr2cd_titulo ?? "-",
            obterCategoria(chamado),
            obterPrioridade(chamado),
            obterStatus(chamado),
            dataCadastro(chamado.createdon),
        ];
        const celulas = valores.map((valor, indice) => quebrarLinhas(valor, larguras[indice] - 16, fonte, 9));
        const numeroLinhas = Math.max(...celulas.map((linhas) => linhas.length));
        let deslocamento = 0;
        while (deslocamento < numeroLinhas) {
            if (y < 84) { novaPagina(); cabecalhoTabela(); }
            const quantidade = Math.min(numeroLinhas - deslocamento, Math.floor((y - 60 - 12) / 12));
            const altura = quantidade * 12 + 12;
            if (indiceRegistro % 2 === 0) {
                pagina.drawRectangle({ x: margem, y: y - altura, width: 762, height: altura, color: claro });
            }
            let x = margem;
            celulas.forEach((linhas, indice) => {
                linhas.slice(deslocamento, deslocamento + quantidade).forEach((linha, posicao) => {
                    pagina.drawText(linha, { x: x + 8, y: y - 15 - posicao * 12, size: 9, font: fonte, color: escuro });
                });
                x += larguras[indice];
            });
            y -= altura;
            pagina.drawLine({ start: { x: margem, y }, end: { x: 802, y }, color: borda, thickness: 0.5 });
            deslocamento += quantidade;
        }
    }

    const paginas = pdf.getPages();
    paginas.forEach((item, indice) => {
        item.drawText("Case - Service Desk", { x: margem, y: 26, size: 8, font: fonte, color: cinza });
        const numero = "Página " + (indice + 1) + " de " + paginas.length;
        item.drawText(numero, { x: 802 - fonte.widthOfTextAtSize(numero, 8), y: 26, size: 8, font: fonte, color: cinza });
    });
    return pdf.save();
}

export async function baixarRelatorioChamados(chamados: Cr2cd_chamados[], filtros: FiltrosChamados) {
    const bytes = await criarPdfChamados(chamados, filtros);
    const blob = new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const agora = new Date();
    const nome = [
        agora.getFullYear(), String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0"),
    ].join("-");
    link.href = url;
    link.download = "chamados-" + nome + ".pdf";
    document.body.appendChild(link);
    try { link.click(); } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

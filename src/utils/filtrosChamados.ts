// Valida datas e combina os critérios de pesquisa da lista de chamados.
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";

export type FiltrosChamados = {
    pesquisa: string;
    status: string;
    prioridade: string;
    dataInicial: string;
    dataFinal: string;
};

// Converte AAAA-MM-DD para meia-noite local e confere se a data existe no calendário.
function dataLocal(valor: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
    const data = new Date(valor + "T00:00:00");
    const [ano, mes, dia] = valor.split("-").map(Number);
    return !Number.isNaN(data.getTime()) && data.getFullYear() === ano
        && data.getMonth() + 1 === mes && data.getDate() === dia ? data : null;
}

// Devolve uma mensagem para datas inválidas ou fora de ordem; texto vazio significa período válido.
export function validarPeriodoDatas(inicio: string, fim: string) {
    if ((inicio && !dataLocal(inicio)) || (fim && !dataLocal(fim))) {
        return "Informe datas válidas.";
    }
    if (inicio && fim && inicio > fim) {
        return "A data inicial não pode ser posterior à data final.";
    }
    return "";
}

// Compara os limites no horário local do usuário e inclui todo o último dia.
export function filtrarChamados(chamados: Cr2cd_chamados[], filtros: FiltrosChamados) {
    if (validarPeriodoDatas(filtros.dataInicial, filtros.dataFinal)) return [];
    const inicio = filtros.dataInicial ? dataLocal(filtros.dataInicial)!.getTime() : null;
    const fim = filtros.dataFinal ? dataLocal(filtros.dataFinal)! : null;
    // Usa o começo do dia seguinte como limite exclusivo, incluindo todas as horas da data final.
    if (fim) fim.setDate(fim.getDate() + 1);
    const limiteFinal = fim?.getTime() ?? null;

    // filter preserva apenas os chamados que atendem a todos os critérios; a pesquisa compara títulos sem diferenciar maiúsculas.
    return chamados.filter((chamado) => {
        const correspondePesquisa = (chamado.cr2cd_titulo ?? "")
            .toLowerCase().includes(filtros.pesquisa.toLowerCase());
        const correspondeStatus = filtros.status === "todos"
            || chamado.cr2cd_status === Number(filtros.status);
        const correspondePrioridade = filtros.prioridade === "todos"
            || chamado.cr2cd_prioridade === Number(filtros.prioridade);
        if (!correspondePesquisa || !correspondeStatus || !correspondePrioridade) return false;
        if (inicio === null && limiteFinal === null) return true;
        // Compara a mesma data de abertura exibida na tabela; registros sem data válida ficam fora do período.
        const abertura = Date.parse(chamado.cr2cd_datadeabertura ?? "");
        return !Number.isNaN(abertura)
            && (inicio === null || abertura >= inicio)
            && (limiteFinal === null || abertura < limiteFinal);
    });
}

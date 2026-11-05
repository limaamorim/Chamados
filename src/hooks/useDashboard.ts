// Carrega indicadores exatos com duas colunas por registro e apenas cinco chamados completos.
import { consultarIndicadores, consultarRecentes } from "../services/chamadosService";
import { useLeituraChamados } from "./useLeituraChamados";
import { agruparChamados } from "../utils/resumoChamados";
import { Cr2cd_chamadoscr2cd_categoria, Cr2cd_chamadoscr2cd_status } from "../generated/models/Cr2cd_chamadosModel";

async function carregarDashboard() {
    const [indicadores, recentes] = await Promise.all([consultarIndicadores(), consultarRecentes()]);
    return {
        recentes,
        total: indicadores.length,
        abertos: indicadores.filter((item) => item.cr2cd_status === 997180000).length,
        emAndamento: indicadores.filter((item) => item.cr2cd_status === 997180001).length,
        resolvidos: indicadores.filter((item) => item.cr2cd_status === 997180002).length,
        porCategoria: agruparChamados(indicadores, "cr2cd_categoria", Cr2cd_chamadoscr2cd_categoria),
        porStatus: agruparChamados(indicadores, "cr2cd_status", Cr2cd_chamadoscr2cd_status),
    };
}
export function useDashboard(versao: number) {
    return useLeituraChamados(String(versao), carregarDashboard);
}

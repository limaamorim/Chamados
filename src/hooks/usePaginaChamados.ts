// Consulta somente uma página e seu total, com os filtros executados no Dataverse.
import { useCallback } from "react";
import { consultarPaginaChamados, contarChamados } from "../services/chamadosService";
import { useLeituraChamados } from "./useLeituraChamados";
import { validarPeriodoDatas } from "../utils/filtrosChamados";
import type { FiltrosChamados } from "../utils/filtrosChamados";

export function usePaginaChamados(filtros: FiltrosChamados, pagina: number, tamanho: number, versao: number, ativo: boolean) {
    const parametros = JSON.stringify(filtros);
    const chave = JSON.stringify([parametros, pagina, tamanho, versao]);
    const carregar = useCallback(async () => {
        const consulta: FiltrosChamados = JSON.parse(parametros);
        if (validarPeriodoDatas(consulta.dataInicial, consulta.dataFinal)) return { chamados: [], total: 0, pagina };
        // Página e contagem independentes são solicitadas em paralelo.
        const [chamados, total] = await Promise.all([
            consultarPaginaChamados(consulta, pagina, tamanho), contarChamados(consulta),
        ]);
        const ultimaPagina = Math.max(1, Math.ceil(total / tamanho));
        // Se uma exclusão esvaziar a última página, consulta a última página válida.
        const paginaValida = Math.min(pagina, ultimaPagina);
        return { chamados: paginaValida === pagina ? chamados : await consultarPaginaChamados(consulta, paginaValida, tamanho), total, pagina: paginaValida };
    }, [parametros, pagina, tamanho]);
    return useLeituraChamados(chave, carregar, ativo, 250);
}

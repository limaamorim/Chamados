import { useState } from "react";
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import { filtrarChamados, paginarChamados, statusChamado } from "../utils/chamados";
import type { FiltrosChamados } from "../utils/chamados";

// Estado local da listagem; não acessa nem modifica o Dataverse.
export function useFiltrosChamados(chamados: Cr2cd_chamados[]) {
    const [filtros, setFiltros] = useState<FiltrosChamados>({
        pesquisa: "", status: "", prioridade: "", categoria: "",
    });
    const [pagina, setPagina] = useState(1);

    function alterarFiltro(campo: keyof FiltrosChamados, valor: string) {
        setFiltros((atuais) => ({ ...atuais, [campo]: valor }));
        setPagina(1);
    }

    // Primeiro filtra toda a lista; só depois separa os dez itens da página.
    const filtrados = filtrarChamados(chamados, filtros);
    const paginacao = paginarChamados(filtrados, pagina);
    const indicadores = statusChamado.map((status) => ({
        ...status,
        total: chamados.filter((chamado) => chamado.cr2cd_status === status.codigo).length,
    }));

    return {
        filtros, alterarFiltro, indicadores,
        totalFiltrados: filtrados.length,
        ...paginacao,
        mudarPagina: (numero: number) => setPagina(
            Math.max(1, Math.min(numero, paginacao.totalPaginas))
        ),
    };
}

// Consultas de leitura com cache curto: separa página, contagem, indicadores e exportação.
import type { Cr2cd_chamados } from "../generated/models/Cr2cd_chamadosModel";
import type { IGetAllOptions } from "../generated/models/CommonModels";
import type { IOperationResult } from "@microsoft/power-apps/data";
import { criarFiltroDataverse } from "../utils/filtrosChamados.ts";
import type { FiltrosChamados } from "../utils/filtrosChamados";

type Consultar = (opcoes: IGetAllOptions) => Promise<IOperationResult<Cr2cd_chamados[]>>;
const ordem = ["createdon desc", "cr2cd_chamadoid asc"];
// Inclui a descrição porque os modais usam os registros da página, sem outra consulta.
const colunas = ["cr2cd_chamadoid", "cr2cd_titulo", "cr2cd_descricao", "cr2cd_numero", "cr2cd_categoria", "cr2cd_prioridade", "cr2cd_status", "cr2cd_datadeabertura", "createdon"];
const colunasPdf = colunas.filter((coluna) => coluna !== "cr2cd_descricao");

export function criarConsultasChamados(consultar: Consultar) {
    // Promessas compartilhadas evitam repetir uma consulta, inclusive no StrictMode.
    const cache = new Map<string, { expira: number; promessa: Promise<unknown> }>();
    let geracao = 0;
    const cursores = new Map<string, string>();
    function memorizar<T>(chave: string, carregar: () => Promise<T>): Promise<T> {
        // Descarta entradas vencidas para pesquisas antigas não acumularem dados em memória.
        const agora = Date.now();
        for (const [nome, entrada] of cache) if (entrada.expira <= agora) cache.delete(nome);
        const existente = cache.get(chave);
        if (existente && existente.expira > Date.now()) return existente.promessa as Promise<T>;
        const promessa = carregar();
        const entrada = { expira: Infinity, promessa };
        cache.set(chave, entrada);
        void promessa.then(() => { entrada.expira = Date.now() + 30_000; }, () => {
            if (cache.get(chave) === entrada) cache.delete(chave);
        });
        return promessa;
    }
    async function buscar(opcoes: IGetAllOptions) {
        const resultado = await consultar(opcoes);
        if (!resultado.success || !resultado.data) throw new Error(resultado.error?.message ?? "Não foi possível carregar os chamados.");
        return resultado;
    }
    async function percorrer(select: string[], filter?: string) {
        const registros: Cr2cd_chamados[] = [];
        let skipToken: string | undefined;
        const vistos = new Set<string>();
        do {
            const resultado = await buscar({ select, filter, orderBy: ordem, maxPageSize: 5000, skipToken });
            registros.push(...resultado.data!);
            skipToken = resultado.skipToken || undefined;
            if (skipToken && vistos.has(skipToken)) throw new Error("O Dataverse repetiu o token de paginação. Tente novamente.");
            if (skipToken) vistos.add(skipToken);
        } while (skipToken);
        return registros;
    }
    function indice(filter: string) {
        // Apenas IDs, usados para contar acima de 5 mil e saltar a páginas ainda não visitadas.
        return memorizar("indice:" + filter, async () => (await percorrer(["cr2cd_chamadoid"], filter)).map((item) => item.cr2cd_chamadoid));
    }
    return {
        invalidar() {
            geracao++;
            cache.clear();
            cursores.clear();
        },
        total(filtros: FiltrosChamados) {
            const filter = criarFiltroDataverse(filtros);
            return memorizar("total:" + filter, async () => {
                const resultado = await buscar({ select: ["cr2cd_chamadoid"], filter, maxPageSize: 1, count: true });
                // O $count de tabelas padrão é limitado a 5 mil. Nunca tratamos esse limite como total exato.
                if (resultado.count !== undefined && resultado.count < 5000) return resultado.count;
                return (await indice(filter)).length;
            });
        },
        pagina(filtros: FiltrosChamados, pagina: number, tamanho: number) {
            const filter = criarFiltroDataverse(filtros);
            const chave = JSON.stringify([filter, tamanho, pagina]);
            const versao = geracao;
            return memorizar("pagina:" + chave, async () => {
                const token = cursores.get(chave);
                if (pagina === 1 || token) {
                    // Na navegação sequencial, usa diretamente o token devolvido pelo Dataverse.
                    const resultado = await buscar({ select: colunas, filter, orderBy: ordem, maxPageSize: tamanho, skipToken: token });
                    if (versao === geracao && resultado.skipToken) cursores.set(JSON.stringify([filter, tamanho, pagina + 1]), resultado.skipToken);
                    return resultado.data!;
                }
                // Dataverse não suporta $skip. Um salto direto consulta os IDs e busca só os dados completos da página escolhida.
                const ids = (await indice(filter)).slice((pagina - 1) * tamanho, pagina * tamanho);
                if (!ids.length) return [];
                const paginaFilter = ids.map((id) => {
                    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Identificador de chamado inválido.");
                    return `cr2cd_chamadoid eq ${id}`;
                }).join(" or ");
                const resultado = await buscar({ select: colunas, filter: `(${filter || "true"}) and (${paginaFilter})`, orderBy: ordem, maxPageSize: tamanho });
                return resultado.data!;
            });
        },
        indicadores() {
            // O SDK gerado não expõe agregações. A alternativa exata consulta só status/categoria em lotes grandes.
            return memorizar("indicadores", () => percorrer(["cr2cd_status", "cr2cd_categoria"]));
        },
        recentes() {
            return memorizar("recentes", async () => (await buscar({ select: colunas, orderBy: ordem, maxPageSize: 5 })).data!);
        },
        exportar(filtros: FiltrosChamados) {
            // A carga completa acontece somente quando o usuário solicita o PDF, já filtrada no servidor.
            return percorrer(colunasPdf, criarFiltroDataverse(filtros));
        },
    };
}

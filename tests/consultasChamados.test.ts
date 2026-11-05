// Simula o transporte Dataverse para conferir consultas, paginação e totais com 10 mil registros.
import assert from "node:assert/strict";
import test from "node:test";
import { criarConsultasChamados } from "../src/services/consultasChamados.ts";
import { criarFiltroDataverse } from "../src/utils/filtrosChamados.ts";
import type { Cr2cd_chamados } from "../src/generated/models/Cr2cd_chamadosModel.ts";
import type { IGetAllOptions } from "../src/generated/models/CommonModels.ts";

const filtros = { pesquisa: "", status: "todos", prioridade: "todos", dataInicial: "", dataFinal: "" };
const registros: Cr2cd_chamados[] = Array.from({ length: 10_000 }, (_, indice) => ({
    cr2cd_chamadoid: `00000000-0000-0000-0000-${indice.toString(16).padStart(12, "0")}`,
    cr2cd_titulo: `Chamado ${indice}`, cr2cd_descricao: "Descrição do chamado".repeat(20),
    cr2cd_status: [997180000, 997180001, 997180002][indice % 3] as Cr2cd_chamados["cr2cd_status"],
    cr2cd_categoria: (997180000 + indice % 6) as Cr2cd_chamados["cr2cd_categoria"],
    cr2cd_prioridade: 997180000, cr2cd_numero: String(indice),
    createdon: new Date(Date.UTC(2026, 10, 5) - indice * 1000).toISOString(),
    cr2cd_datadeabertura: "2026-11-05T12:00:00Z", statecode: 0, ownerid: "usuario",
}));
function simular(latencia = 0) {
    const chamadas: IGetAllOptions[] = [];
    const consultar = async (opcoes: IGetAllOptions) => {
        chamadas.push(opcoes);
        if (latencia) await new Promise((resolver) => setTimeout(resolver, latencia));
        const ids = [...(opcoes.filter ?? "").matchAll(/cr2cd_chamadoid eq ([a-f0-9-]+)/gi)].map((match) => match[1]);
        const dados = ids.length ? registros.filter((item) => ids.includes(item.cr2cd_chamadoid)) : registros;
        const inicio = Number(opcoes.skipToken ?? 0);
        const fim = inicio + (opcoes.maxPageSize ?? 500);
        const pagina = dados.slice(inicio, fim).map((item) => Object.fromEntries((opcoes.select ?? Object.keys(item)).map((coluna) => [coluna, item[coluna as keyof Cr2cd_chamados]])) as Cr2cd_chamados);
        return { success: true, data: pagina, count: opcoes.count ? Math.min(5000, dados.length) : undefined, skipToken: fim < dados.length ? String(fim) : undefined };
    };
    return { chamadas, consultar, consultas: criarConsultasChamados(consultar) };
}

test("primeira página retorna somente 20 registros completos", async () => {
    const { consultas, chamadas } = simular();
    const pagina = await consultas.pagina(filtros, 1, 20);
    assert.equal(pagina.length, 20);
    assert.equal(chamadas.length, 1);
    assert.equal(chamadas[0].maxPageSize, 20);
    assert.ok(chamadas[0].select!.includes("cr2cd_descricao"));
    assert.equal(chamadas[0].skip, undefined);
});
test("contagem acima do limite de 5 mil continua exata, consultando só IDs", async () => {
    const { consultas, chamadas } = simular();
    assert.equal(await consultas.total(filtros), 10_000);
    assert.equal(chamadas.length, 3);
    assert.ok(chamadas.every((chamada) => chamada.select!.join() === "cr2cd_chamadoid"));
});
test("count abaixo de 5 mil não percorre a tabela", async () => {
    let chamadas = 0;
    const consultas = criarConsultasChamados(async () => { chamadas++; return { success: true, data: [], count: 1234 }; });
    assert.equal(await consultas.total(filtros), 1234);
    assert.equal(chamadas, 1);
});
test("consultas simultâneas idênticas compartilham uma promessa", async () => {
    const { consultas, chamadas } = simular(5);
    const [a, b] = await Promise.all([consultas.pagina(filtros, 1, 20), consultas.pagina(filtros, 1, 20)]);
    assert.equal(a, b);
    assert.equal(chamadas.length, 1);
});
test("página seguinte usa token, preserva ordem e não usa skip", async () => {
    const { consultas, chamadas } = simular();
    await consultas.pagina(filtros, 1, 20);
    const segunda = await consultas.pagina(filtros, 2, 20);
    assert.equal(segunda[0].cr2cd_chamadoid, registros[20].cr2cd_chamadoid);
    assert.equal(chamadas.length, 2);
    assert.equal(chamadas[1].skipToken, "20");
    assert.ok(chamadas.every((chamada) => chamada.skip === undefined));
});
test("salto direto à página 500 busca só seus 20 registros completos", async () => {
    const { consultas, chamadas } = simular();
    const pagina = await consultas.pagina(filtros, 500, 20);
    assert.equal(pagina[0].cr2cd_chamadoid, registros[9980].cr2cd_chamadoid);
    assert.equal(pagina.length, 20);
    assert.equal(chamadas.length, 3);
    assert.ok(chamadas.slice(0, 2).every((chamada) => chamada.select!.length === 1));
});
test("cache de IDs é compartilhado entre contagem e salto de página", async () => {
    const { consultas, chamadas } = simular();
    await Promise.all([consultas.total(filtros), consultas.pagina(filtros, 500, 20)]);
    assert.equal(chamadas.filter((chamada) => chamada.maxPageSize === 5000).length, 2);
});
test("indicadores não baixam títulos nem descrições e incluem todos os 10 mil", async () => {
    const { consultas, chamadas } = simular();
    const indicadores = await consultas.indicadores();
    assert.equal(indicadores.length, 10_000);
    assert.equal(indicadores.filter((item) => item.cr2cd_status === 997180000).length, 3334);
    assert.equal(chamadas.length, 2);
    assert.ok(chamadas.every((chamada) => chamada.select!.join() === "cr2cd_status,cr2cd_categoria"));
});
test("últimos chamados limita a consulta a cinco registros", async () => {
    const { consultas, chamadas } = simular();
    assert.equal((await consultas.recentes()).length, 5);
    assert.equal(chamadas.length, 1);
});
test("PDF consulta todos os resultados só quando solicitado e não inclui descrição", async () => {
    const { consultas, chamadas } = simular();
    assert.equal(chamadas.length, 0);
    assert.equal((await consultas.exportar(filtros)).length, 10_000);
    assert.equal(chamadas.length, 2);
    assert.ok(chamadas.every((chamada) => !chamada.select!.includes("cr2cd_descricao")));
});
test("invalidar após gravação força uma nova leitura", async () => {
    const { consultas, chamadas } = simular();
    await consultas.pagina(filtros, 1, 20);
    consultas.invalidar();
    await consultas.pagina(filtros, 1, 20);
    assert.equal(chamadas.length, 2);
});
test("falha na consulta não fica presa no cache", async () => {
    let chamadas = 0;
    const consultas = criarConsultasChamados(async () => {
        if (++chamadas === 1) return { success: false, data: [] };
        return { success: true, data: registros.slice(0, 20) };
    });
    await assert.rejects(consultas.pagina(filtros, 1, 20));
    assert.equal((await consultas.pagina(filtros, 1, 20)).length, 20);
});
test("condições combinadas são enviadas ao servidor e aspas da pesquisa são escapadas", async () => {
    const { consultas, chamadas } = simular();
    const consulta = { ...filtros, pesquisa: "d'água", status: "997180000", prioridade: "997180002", dataInicial: "2026-11-04", dataFinal: "2026-11-05" };
    await consultas.pagina(consulta, 1, 20);
    const filter = chamadas[0].filter!;
    assert.ok(filter.includes("contains(cr2cd_titulo,'d''água')"));
    assert.ok(filter.includes("cr2cd_status eq 997180000"));
    assert.ok(filter.includes("cr2cd_prioridade eq 997180002"));
    assert.ok(filter.includes("cr2cd_datadeabertura ge "));
    assert.ok(filter.includes("cr2cd_datadeabertura lt "));
    assert.throws(() => criarFiltroDataverse({ ...filtros, status: "0 or true" }));
});

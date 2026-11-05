import assert from "node:assert/strict";
import test from "node:test";
import { filtrarChamados, validarPeriodoDatas } from "../src/utils/filtrosChamados.ts";
import type { Cr2cd_chamados } from "../src/generated/models/Cr2cd_chamadosModel.ts";

// Fixa o fuso para conferir os limites de dia independentemente do computador que executa o teste.
process.env.TZ = "America/Recife";

// Garante que o período use a mesma data de abertura que o usuário vê na tabela.
const registros: Cr2cd_chamados[] = [
    { cr2cd_chamadoid: "1", statecode: 0, ownerid: "usuario", cr2cd_titulo: "VPN", cr2cd_status: 997180000, cr2cd_prioridade: 997180002, cr2cd_datadeabertura: "2026-11-04T00:00:00-03:00", createdon: "2026-10-01T12:00:00-03:00" },
    { cr2cd_chamadoid: "2", statecode: 0, ownerid: "usuario", cr2cd_titulo: "Email", cr2cd_status: 997180001, cr2cd_prioridade: 997180001, cr2cd_datadeabertura: "2026-11-04T23:59:59.999-03:00", createdon: "2026-11-05T12:00:00-03:00" },
    { cr2cd_chamadoid: "3", statecode: 0, ownerid: "usuario", cr2cd_titulo: "Rede", cr2cd_status: 997180000, cr2cd_prioridade: 997180000, cr2cd_datadeabertura: "2026-11-05T00:00:00-03:00", createdon: "2026-11-04T12:00:00-03:00" },
    { cr2cd_chamadoid: "4", statecode: 0, ownerid: "usuario", createdon: "2026-11-04T12:00:00-03:00" },
    { cr2cd_chamadoid: "5", statecode: 0, ownerid: "usuario", cr2cd_datadeabertura: "inválida", createdon: "2026-11-04T12:00:00-03:00" },
];
const padrao = { pesquisa: "", status: "todos", prioridade: "todos", dataInicial: "", dataFinal: "" };
const ids = (filtros: Partial<typeof padrao>) => filtrarChamados(registros, { ...padrao, ...filtros }).map((registro) => registro.cr2cd_chamadoid);

test("filtra pela abertura, mesmo quando o cadastro tem outra data", () => {
    assert.deepEqual(ids({ dataInicial: "2026-11-04", dataFinal: "2026-11-04" }), ["1", "2"]);
});
test("inclui o fim do dia e exclui meia-noite do dia seguinte", () => {
    assert.deepEqual(ids({ dataFinal: "2026-11-04" }), ["1", "2"]);
});
test("aceita apenas a data inicial", () => {
    assert.deepEqual(ids({ dataInicial: "2026-11-05" }), ["3"]);
});
test("combina período, pesquisa, status e prioridade", () => {
    assert.deepEqual(ids({ dataInicial: "2026-11-04", dataFinal: "2026-11-04", pesquisa: "vpn", status: "997180000", prioridade: "997180002" }), ["1"]);
});
test("sem período, mantém também registros sem data de abertura válida", () => {
    assert.deepEqual(ids({}), ["1", "2", "3", "4", "5"]);
});
test("não usa o cadastro como substituto para abertura ausente ou inválida", () => {
    assert.deepEqual(ids({ dataInicial: "2026-11-04" }), ["1", "2", "3"]);
});
test("rejeita período invertido e datas inexistentes", () => {
    assert.ok(validarPeriodoDatas("2026-11-05", "2026-11-04"));
    assert.ok(validarPeriodoDatas("2026-02-30", ""));
    assert.deepEqual(ids({ dataInicial: "2026-11-05", dataFinal: "2026-11-04" }), []);
});
test("filtra antes do recorte da paginação", () => {
    const lista = Array.from({ length: 45 }, (_, indice) => ({ ...registros[0], cr2cd_chamadoid: String(indice) }));
    const filtrados = filtrarChamados(lista, { ...padrao, dataInicial: "2026-11-04", dataFinal: "2026-11-04" });
    assert.equal(filtrados.length, 45);
    assert.equal(filtrados.slice(40, 60).length, 5);
});

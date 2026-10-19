import { useState } from "react";
import { Cr2cd_chamadosService } from "../../generated/services/Cr2cd_chamadosService";
import Header from "../../components/ui/Header";
import BotaoNovoChamado from "../../components/ui/BotaoNovoChamado";
import { FLW_NotificarNovoChamadoService } from "../../generated/services/FLW_NotificarNovoChamadoService";

import type {
    Cr2cd_chamadosBase,
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_prioridade,
} from "../../generated/models/Cr2cd_chamadosModel";

import "./NovoChamado.css";

type NovoChamadoProps = {
    voltar: () => void;
};

function NovoChamado({ voltar }: NovoChamadoProps) {
    const [titulo, setTitulo] = useState("");

    const [categoria, setCategoria] =
        useState<Cr2cd_chamadoscr2cd_categoria>(997180000);

    const [prioridade, setPrioridade] =
        useState<Cr2cd_chamadoscr2cd_prioridade>(997180000);

    const [descricao, setDescricao] = useState("");

    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const nomesCategoria: Record<number, string> = {
        997180000: "Acesso",
        997180001: "Software",
        997180002: "Hardware",
        997180003: "Rede",
        997180004: "E-mail",
        997180005: "Outros",
    };

    const nomesPrioridade: Record<number, string> = {
        997180000: "Baixa",
        997180001: "Média",
        997180002: "Alta",
    };

    async function criarChamado() {
        if (!titulo.trim() || !descricao.trim()) {
            setErro("Preencha o título e a descrição.");
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem("");

        const novoChamado: Omit<
            Cr2cd_chamadosBase,
            "cr2cd_chamadoid"
        > = {
            cr2cd_titulo: titulo.trim(),
            cr2cd_descricao: descricao.trim(),

            cr2cd_categoria: categoria,
            cr2cd_prioridade: prioridade,

            // Aberto
            cr2cd_status: 997180000,

            cr2cd_solicitante: "José Amorim",
            cr2cd_datadeabertura: new Date().toISOString(),

            statecode: 0,
        };

        try {
            console.log("1 - Vou enviar para o Dataverse");
            console.log("Registro:", novoChamado);

            const resultado = await Cr2cd_chamadosService.create(novoChamado);

            console.log("2 - Chamado salvo no Dataverse");

            const resultadoFluxo =
                await FLW_NotificarNovoChamadoService.Run({
                    text: titulo.trim(),
                    text_1: descricao.trim(),
                    text_2: nomesCategoria[categoria],
                    text_4: nomesPrioridade[prioridade],
                });

            console.log("3 - Resultado do fluxo:", resultadoFluxo);

            console.log("2 - Dataverse respondeu");
            console.log("Resultado:", resultado);

            setTitulo("");
            setCategoria(997180000);
            setPrioridade(997180000);
            setDescricao("");

            setMensagem("Chamado criado com sucesso!");

            setTimeout(() => {
                setMensagem("");
            }, 3000);

        } catch (error) {

            console.error("3 - ERRO AO CRIAR:", error);

            setErro("Não foi possível criar o chamado. Veja o console.");

        } finally {

            console.log("4 - Finalizou");
            setSalvando(false);

        }
    }

    return (
        <section className="novo-chamado-pagina">
            <Header
                titulo="Novo chamado"
                descricao="Preencha os dados da sua solicitação."
            />

            {mensagem && (
                <div className="mensagem-sucesso">
                    ✓ {mensagem}
                </div>
            )}

            {erro && (
                <div className="mensagem-erro">
                    {erro}
                </div>
            )}

            <div className="formulario-card">
                <div className="campo-formulario campo-completo">
                    <label htmlFor="titulo">Título</label>

                    <input
                        id="titulo"
                        type="text"
                        placeholder="Informe o assunto do chamado"
                        value={titulo}
                        onChange={(evento) => setTitulo(evento.target.value)}
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="categoria">Categoria</label>

                    <select
                        id="categoria"
                        value={categoria}
                        onChange={(evento) =>
                            setCategoria(
                                Number(
                                    evento.target.value
                                ) as Cr2cd_chamadoscr2cd_categoria
                            )
                        }
                    >
                        <option value={997180000}>Acesso</option>
                        <option value={997180001}>Software</option>
                        <option value={997180002}>Hardware</option>
                        <option value={997180003}>Rede</option>
                        <option value={997180004}>E-mail</option>
                        <option value={997180005}>Outros</option>
                    </select>
                </div>

                <div className="campo-formulario">
                    <label htmlFor="prioridade">Prioridade</label>

                    <select
                        id="prioridade"
                        value={prioridade}
                        onChange={(evento) =>
                            setPrioridade(
                                Number(
                                    evento.target.value
                                ) as Cr2cd_chamadoscr2cd_prioridade
                            )
                        }
                    >
                        <option value={997180000}>Baixa</option>
                        <option value={997180001}>Média</option>
                        <option value={997180002}>Alta</option>
                    </select>
                </div>

                <div className="campo-formulario campo-completo">
                    <label htmlFor="descricao">Descrição</label>

                    <textarea
                        id="descricao"
                        rows={7}
                        placeholder="Descreva o problema com detalhes"
                        value={descricao}
                        onChange={(evento) =>
                            setDescricao(evento.target.value)
                        }
                    />
                </div>

                <div className="acoes-formulario">
                    <button
                        type="button"
                        className="botao-cancelar"
                        onClick={voltar}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>

                    <BotaoNovoChamado
                        aoClicar={criarChamado}
                        texto={salvando ? "Criando..." : "Criar chamado"}
                        disabled={salvando}
                    />
                </div>
            </div>
        </section>
    );
}

export default NovoChamado;
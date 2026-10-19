import { useEffect, useState } from "react";
import { criarChamado } from "../../services/chamadosService";
import {
    categoriasChamado,
    prioridadesChamado,
    CATEGORIA_PADRAO,
    PRIORIDADE_PADRAO,
    validarCamposChamado,
} from "../../utils/chamados";
import Header from "../../components/ui/Header";
import BotaoNovoChamado from "../../components/ui/BotaoNovoChamado";

import type {
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_prioridade,
} from "../../generated/models/Cr2cd_chamadosModel";

import "./NovoChamado.css";

type NovoChamadoProps = {
    voltar: () => void;
};

function NovoChamado({ voltar }: NovoChamadoProps) {
    // Estados locais: guardam os valores dos campos e atualizam a interface.
    const [titulo, setTitulo] = useState("");

    const [categoria, setCategoria] =
        useState<Cr2cd_chamadoscr2cd_categoria>(CATEGORIA_PADRAO);

    const [prioridade, setPrioridade] =
        useState<Cr2cd_chamadoscr2cd_prioridade>(PRIORIDADE_PADRAO);

    const [descricao, setDescricao] = useState("");

    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const [aviso, setAviso] = useState("");

    // O efeito remove a mensagem depois de 3 segundos e cancela o timer ao sair da página.
    useEffect(() => {
        if (!mensagem) return;
        const timer = window.setTimeout(() => setMensagem(""), 3000);
        return () => window.clearTimeout(timer);
    }, [mensagem]);

    // A página controla o formulário; o service cuida da gravação e da notificação.
    async function salvarNovoChamado() {
        if (salvando) return;
        const erroValidacao = validarCamposChamado(titulo, descricao);
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem("");
        setAviso("");

        try {
            // Mantém o solicitante usado no protótipo atual.
            const resultado = await criarChamado({ titulo, descricao, categoria, prioridade }, "José Amorim");
            setTitulo("");
            setDescricao("");
            setCategoria(CATEGORIA_PADRAO);
            setPrioridade(PRIORIDADE_PADRAO);
            setMensagem("Chamado criado com sucesso!");
            setAviso(resultado.aviso);
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível criar o chamado.");
        } finally {
            setSalvando(false);
        }
    }

    // Interface da página.
    return (
        <section className="novo-chamado-pagina">
            <Header
                titulo="Novo chamado"
                descricao="Preencha os dados da sua solicitação."
                mensagem={mensagem}
            />

            {aviso && <p className="mensagem-aviso" role="status">{aviso}</p>}

            {erro && (
                <div className="mensagem-erro" role="alert">
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
                        {categoriasChamado.map(({ codigo, nome }) => (
                            <option key={codigo} value={codigo}>{nome}</option>
                        ))}
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
                        {prioridadesChamado.map(({ codigo, nome }) => (
                            <option key={codigo} value={codigo}>{nome}</option>
                        ))}
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
                        aoClicar={salvarNovoChamado}
                        texto={salvando ? "Criando..." : "Criar chamado"}
                        disabled={salvando}
                    />
                </div>
            </div>
        </section>
    );
}

export default NovoChamado;

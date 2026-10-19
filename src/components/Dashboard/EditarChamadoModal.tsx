
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import {
    Cr2cd_chamadoscr2cd_categoria,
    Cr2cd_chamadoscr2cd_prioridade,
} from "../../generated/models/Cr2cd_chamadosModel";
import "./EditarChamadoModal.css";
import "./Modal.css";

type EditarChamadoModalProps = {
    chamado: Cr2cd_chamados;
    titulo: string;
    setTitulo: (valor: string) => void;
    descricao: string;
    setDescricao: (valor: string) => void;
    salvando: boolean;
    fechar: () => void;
    salvar: () => void;
    obterStatus: (chamado: Cr2cd_chamados) => string;
    atualizarChamado: (chamado: Cr2cd_chamados) => void;
};

function EditarChamadoModal({
    chamado,
    titulo,
    setTitulo,
    descricao,
    setDescricao,
    salvando,
    fechar,
    salvar,
    obterStatus,
    atualizarChamado,
}: EditarChamadoModalProps) {
    const categorias = Object.entries(Cr2cd_chamadoscr2cd_categoria)
        .filter(([chave, valor]) => Number.isNaN(Number(chave)) && typeof valor === "number");

    const prioridades = Object.entries(Cr2cd_chamadoscr2cd_prioridade)
        .filter(([chave, valor]) => Number.isNaN(Number(chave)) && typeof valor === "number");

    return (
        <div
            className="modal-fundo"
            onClick={() => {
                if (!salvando) fechar();
            }}
        >
            <div
                className="modal-chamado modal-edicao"
                onClick={(evento) => evento.stopPropagation()}
            >
                <div className="modal-topo">
                    <div>
                        <span className="modal-numero">
                            CH-{chamado.cr2cd_numero}
                        </span>
                        <h2>Editar chamado</h2>
                    </div>

                    <button
                        className="modal-fechar"
                        onClick={fechar}
                        disabled={salvando}
                        aria-label="Fechar edição"
                    >
                        ×
                    </button>
                </div>

                <div className="formulario-edicao">
                    <div className="campo-edicao">
                        <label>Status</label>
                        <input
                            type="text"
                            value={obterStatus(chamado)}
                            disabled
                        />
                    </div>

                    <div className="campo-edicao campo-edicao-completo">
                        <label htmlFor="titulo-edicao">Título</label>
                        <input
                            id="titulo-edicao"
                            type="text"
                            value={titulo}
                            onChange={(evento) => setTitulo(evento.target.value)}
                            placeholder="Digite o título do chamado"
                        />
                    </div>

                    <div className="campo-edicao">
                        <label htmlFor="categoria-edicao">Categoria</label>
                        <select
                            id="categoria-edicao"
                            value={chamado.cr2cd_categoria ?? ""}
                            onChange={(evento) =>
                                atualizarChamado({
                                    ...chamado,
                                    cr2cd_categoria: Number(
                                        evento.target.value
                                    ) as Cr2cd_chamadoscr2cd_categoria,
                                })
                            }
                        >
                            {categorias.map(([chave, valor]) => (
                                <option key={chave} value={valor}>
                                    {chave}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-edicao">
                        <label htmlFor="prioridade-edicao">Prioridade</label>
                        <select
                            id="prioridade-edicao"
                            value={chamado.cr2cd_prioridade ?? ""}
                            onChange={(evento) =>
                                atualizarChamado({
                                    ...chamado,
                                    cr2cd_prioridade: Number(
                                        evento.target.value
                                    ) as Cr2cd_chamadoscr2cd_prioridade,
                                })
                            }
                        >
                            {prioridades.map(([chave, valor]) => (
                                <option key={chave} value={valor}>
                                    {chave}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-edicao campo-edicao-completo">
                        <label htmlFor="descricao-edicao">Descrição</label>
                        <textarea
                            id="descricao-edicao"
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder="Descreva o problema ou solicitação"
                            rows={5}
                        />
                    </div>
                </div>

                <div className="modal-acoes">
                    <button
                        className="botao-modal-cancelar"
                        onClick={fechar}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>

                    <button
                        className="botao-modal-salvar"
                        onClick={salvar}
                        disabled={salvando}
                    >
                        {salvando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditarChamadoModal;

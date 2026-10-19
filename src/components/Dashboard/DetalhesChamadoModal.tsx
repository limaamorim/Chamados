
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";

import "./DetalhesChamadoModal.css";

type DetalhesChamadoModalProps = {
    chamado: Cr2cd_chamados;
    fechar: () => void;
    obterStatus: (chamado: Cr2cd_chamados) => string;
    obterCategoria: (chamado: Cr2cd_chamados) => string;
    obterPrioridade: (chamado: Cr2cd_chamados) => string;
};

function DetalhesChamadoModal({
    chamado,
    fechar,
    obterStatus,
    obterCategoria,
    obterPrioridade,
}: DetalhesChamadoModalProps) {
    return (
        <div
            className="modal-fundo"
            onClick={fechar}
        >
            <div
                className="modal-chamado"
                onClick={(evento) => evento.stopPropagation()}
            >
                <div className="modal-topo">
                    <div>
                        <span className="modal-numero">
                            CH-{chamado.cr2cd_numero}
                        </span>

                        <h2>Detalhes do chamado</h2>
                    </div>

                    <button
                        className="modal-fechar"
                        onClick={fechar}
                        aria-label="Fechar detalhes"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-conteudo">
                    <div>
                        <span>Status</span>
                        <strong>{obterStatus(chamado)}</strong>
                    </div>

                    <div>
                        <span>Categoria</span>
                        <strong>{obterCategoria(chamado)}</strong>
                    </div>

                    <div>
                        <span>Criado em</span>
                        <strong>
                            {chamado.createdon
                                ? new Date(
                                    chamado.createdon
                                ).toLocaleString("pt-BR")
                                : "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Prioridade</span>
                        <strong>{obterPrioridade(chamado)}</strong>
                    </div>

                    <div className="modal-titulo">
                        <span>Título</span>
                        <strong>
                            {chamado.cr2cd_titulo ?? "-"}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetalhesChamadoModal;

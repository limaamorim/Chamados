
import type { Cr2cd_chamados } from "../../generated/models/Cr2cd_chamadosModel";
import "./ExcluirChamadoModal.css";
import "./Modal.css";

type ExcluirChamadoModalProps = {
    chamado: Cr2cd_chamados;
    excluindo: boolean;
    fechar: () => void;
    confirmar: () => void;
};

function ExcluirChamadoModal({
    chamado,
    excluindo,
    fechar,
    confirmar,
}: ExcluirChamadoModalProps) {
    return (
        <div
            className="modal-fundo"
            onClick={() => {
                if (!excluindo) fechar();
            }}
        >
            <div
                className="modal-chamado modal-exclusao"
                onClick={(evento) => evento.stopPropagation()}
            >
                <div className="modal-topo">
                    <div>
                        <span className="modal-numero">
                            CH-{chamado.cr2cd_numero}
                        </span>
                        <h2>Excluir chamado</h2>
                    </div>

                    <button
                        className="modal-fechar"
                        onClick={fechar}
                        disabled={excluindo}
                        aria-label="Fechar exclusão"
                    >
                        ×
                    </button>
                </div>

                <div className="conteudo-exclusao">
                    <p>
                        Tem certeza de que deseja excluir este chamado?
                    </p>

                    <strong>{chamado.cr2cd_titulo ?? "Sem título"}</strong>

                    <p className="aviso-exclusao">
                        Essa ação não poderá ser desfeita.
                    </p>
                </div>

                <div className="modal-acoes">
                    <button
                        className="botao-modal-cancelar"
                        onClick={fechar}
                        disabled={excluindo}
                    >
                        Cancelar
                    </button>

                    <button
                        className="botao-confirmar-exclusao"
                        onClick={confirmar}
                        disabled={excluindo}
                    >
                        {excluindo ? "Excluindo..." : "Confirmar exclusão"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExcluirChamadoModal;

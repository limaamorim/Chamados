import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import {
    obterStatus,
    obterCategoria,
    obterPrioridade,
} from "../../../utils/chamados";
import Modal from "../../../components/ui/Modal";
import "./DetalhesChamadoModal.css";

type Props = { chamado: Cr2cd_chamados; fechar: () => void };

export default function DetalhesChamadoModal({ chamado, fechar }: Props) {
    return (
        <Modal
            titulo="Detalhes do chamado"
            subtitulo={`CH-${chamado.cr2cd_numero ?? "-"}`}
            fechar={fechar}
        >
            <dl className="detalhes-chamado">
                <div>
                    <dt>Status</dt>
                    <dd>{obterStatus(chamado)}</dd>
                </div>
                <div>
                    <dt>Categoria</dt>
                    <dd>{obterCategoria(chamado)}</dd>
                </div>
                <div>
                    <dt>Criado em</dt>
                    <dd>
                        {chamado.createdon
                            ? new Date(chamado.createdon).toLocaleString(
                                  "pt-BR"
                              )
                            : "-"}
                    </dd>
                </div>
                <div>
                    <dt>Prioridade</dt>
                    <dd>{obterPrioridade(chamado)}</dd>
                </div>
                <div className="detalhe-completo">
                    <dt>Título</dt>
                    <dd>{chamado.cr2cd_titulo ?? "-"}</dd>
                </div>
                <div className="detalhe-completo">
                    <dt>Descrição</dt>
                    <dd>{chamado.cr2cd_descricao ?? "-"}</dd>
                </div>
            </dl>
        </Modal>
    );
}

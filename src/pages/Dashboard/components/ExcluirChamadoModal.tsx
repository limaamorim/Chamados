import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Mensagem from "../../../components/ui/Mensagem";
import "./ExcluirChamadoModal.css";

type Props = {
    chamado: Cr2cd_chamados;
    erro: string;
    excluindo: boolean;
    fechar: () => void;
    confirmar: () => Promise<boolean>;
};

export default function ExcluirChamadoModal({
    chamado,
    erro,
    excluindo,
    fechar,
    confirmar,
}: Props) {
    async function excluir() {
        if (await confirmar()) fechar();
    }
    return (
        <Modal
            titulo="Excluir chamado"
            subtitulo={`CH-${chamado.cr2cd_numero ?? "-"}`}
            ocupado={excluindo}
            fechar={fechar}
            acoes={
                <>
                    <Button
                        variante="secundario"
                        onClick={fechar}
                        disabled={excluindo}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variante="perigo"
                        onClick={excluir}
                        disabled={excluindo}
                    >
                        {excluindo ? "Excluindo..." : "Confirmar exclusão"}
                    </Button>
                </>
            }
        >
            <Mensagem tipo="erro">{erro}</Mensagem>
            <div className="conteudo-exclusao">
                <p>Tem certeza de que deseja excluir este chamado?</p>
                <strong>{chamado.cr2cd_titulo ?? "Sem título"}</strong>
                <p className="aviso-exclusao">
                    Essa ação não poderá ser desfeita.
                </p>
            </div>
        </Modal>
    );
}

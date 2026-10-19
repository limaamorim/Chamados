import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { Cr2cd_chamados } from "../../../generated/models/Cr2cd_chamadosModel";
import type { DadosChamado } from "../../../utils/chamados";
import { criarDadosFormulario, obterStatus } from "../../../utils/chamados";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Mensagem from "../../../components/ui/Mensagem";
import ChamadoCampos from "../../../components/chamados/ChamadoCampos";
import "./EditarChamadoModal.css";

type Props = {
    chamado: Cr2cd_chamados;
    erro: string;
    salvando: boolean;
    fechar: () => void;
    salvar: (dados: DadosChamado) => Promise<boolean>;
};

export default function EditarChamadoModal({
    chamado,
    erro,
    salvando,
    fechar,
    salvar,
}: Props) {
    // O rascunho fica no modal; o Dashboard não precisa conhecer cada campo da edição.
    const [dados, setDados] = useState(() => criarDadosFormulario(chamado));
    const formId = useId();
    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (await salvar(dados)) fechar();
    }
    return (
        <Modal
            titulo="Editar chamado"
            subtitulo={`CH-${chamado.cr2cd_numero ?? "-"}`}
            ocupado={salvando}
            fechar={fechar}
            acoes={
                <>
                    <Button
                        variante="secundario"
                        onClick={fechar}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </>
            }
        >
            <Mensagem tipo="erro">{erro}</Mensagem>
            <p className="edicao-status">
                Status: <strong>{obterStatus(chamado)}</strong>
            </p>
            <form id={formId} onSubmit={enviar}>
                <ChamadoCampos
                    dados={dados}
                    alterar={setDados}
                    disabled={salvando}
                />
            </form>
        </Modal>
    );
}

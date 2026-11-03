import { useId, useState } from "react";
import type { FormEvent } from "react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Mensagem from "../../../components/ui/Mensagem";
import ChamadoCampos from "../../../components/chamados/ChamadoCampos";
import { useCriarChamado } from "../../../hooks/useCriarChamado";
import { criarDadosFormulario } from "../../../utils/chamados";

type Props = {
    fechar: () => void;
    aoCriar: (aviso: string) => void;
};

// Formulário movido da página NovoChamado, mantendo os campos e o hook existentes.
export default function NovoChamadoModal({ fechar, aoCriar }: Props) {
    const [dados, setDados] = useState(criarDadosFormulario);
    const { salvar, salvando, erro } = useCriarChamado();
    const formId = useId();

    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const resultado = await salvar(dados);
        if (resultado) aoCriar(resultado.aviso);
    }

    return (
        <Modal
            titulo="Novo chamado"
            subtitulo="Preencha os dados da sua solicitação."
            ocupado={salvando}
            fechar={fechar}
            acoes={
                <>
                    <Button variante="secundario" onClick={fechar} disabled={salvando}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} icone="+" disabled={salvando}>
                        {salvando ? "Criando..." : "Criar chamado"}
                    </Button>
                </>
            }
        >
            <Mensagem tipo="erro">{erro}</Mensagem>
            <form id={formId} onSubmit={enviar}>
                <ChamadoCampos dados={dados} alterar={setDados} disabled={salvando} />
            </form>
        </Modal>
    );
}

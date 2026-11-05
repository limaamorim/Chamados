// Monta o formulário de criação e entrega o resultado ao App após salvar.
import { useId, useState } from "react";
import type { FormEvent } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Mensagem from "../ui/Mensagem";
import ChamadoCampos from "./ChamadoCampos";
import { useCriarChamado } from "../../hooks/useCriarChamado";
import { criarDadosFormulario } from "../../utils/chamados";

type Props = {
    fechar: () => void;
    aoCriar: (aviso: string) => void;
};

// Formulário compartilhado de criação; o App controla sua abertura e fechamento.
export default function NovoChamadoModal({ fechar, aoCriar }: Props) {
    // useState cria o rascunho uma vez; o hook separado controla a gravação e seus erros.
    const [dados, setDados] = useState(criarDadosFormulario);
    const { salvar, salvando, erro } = useCriarChamado();
    const formId = useId();

    // Evita o envio padrão do HTML, aguarda a gravação e avisa o App somente se o registro foi criado.
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

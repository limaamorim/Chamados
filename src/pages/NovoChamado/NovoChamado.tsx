import { useState } from "react";
import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import ChamadoCampos from "../../components/chamados/ChamadoCampos";
import { useCriarChamado } from "../../hooks/useCriarChamado";
import { criarDadosFormulario } from "../../utils/chamados";
import type { FormEvent } from "react";
import "./NovoChamado.css";

type NovoChamadoProps = { voltar: () => void };

export default function NovoChamado({ voltar }: NovoChamadoProps) {
    // Somente o rascunho do formulário pertence à página; a operação fica no hook.
    const [dados, setDados] = useState(criarDadosFormulario);
    const { salvar, salvando, erro, aviso, mensagem } = useCriarChamado();

    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const criado = await salvar(dados);
        // Ideia de ResetForm: só volta aos valores iniciais se a criação deu certo.
        if (criado) setDados(criarDadosFormulario());
    }

    return (
        <Pagina
            titulo="Novo chamado"
            descricao="Preencha os dados da sua solicitação."
            mensagem={mensagem}
            erro={erro}
            aviso={aviso}
        >
            <form className="formulario-card" onSubmit={enviar}>
                <ChamadoCampos
                    dados={dados}
                    alterar={setDados}
                    disabled={salvando}
                />
                <div className="acoes-formulario">
                    <Button
                        variante="secundario"
                        onClick={voltar}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" icone="+" disabled={salvando}>
                        {salvando ? "Criando..." : "Criar chamado"}
                    </Button>
                </div>
            </form>
        </Pagina>
    );
}

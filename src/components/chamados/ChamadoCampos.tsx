import { useId } from "react";
import { categoriasChamado, prioridadesChamado } from "../../utils/chamados";
import type { DadosChamado } from "../../utils/chamados";
import "./ChamadoCampos.css";

type ChamadoCamposProps = {
    dados: DadosChamado;
    alterar: (dados: DadosChamado) => void;
    disabled?: boolean;
};

// Componente de domínio: compartilhado entre criação e edição, mas não é um controle genérico de UI.
export default function ChamadoCampos({
    dados,
    alterar,
    disabled = false,
}: ChamadoCamposProps) {
    // alterar recebe setDados do formulário: lembra UpdateContext para o rascunho.
    // {...dados, titulo: novoValor} copia os campos e troca só titulo; não grava no Dataverse.
    // Salvar no banco é outra etapa, feita por criarChamado/atualizarChamado (ideia de Patch).
    const id = useId();
    return (
        <fieldset className="chamado-campos" disabled={disabled}>
            <legend className="somente-leitor">Dados do chamado</legend>
            <div className="chamado-campo chamado-campo-completo">
                <label htmlFor={`${id}-titulo`}>Título</label>
                <input
                    id={`${id}-titulo`}
                    value={dados.titulo}
                    onChange={(e) =>
                        alterar({ ...dados, titulo: e.target.value })
                    }
                    placeholder="Informe o assunto do chamado"
                />
            </div>
            <div className="chamado-campo">
                <label htmlFor={`${id}-categoria`}>Categoria</label>
                <select
                    id={`${id}-categoria`}
                    value={dados.categoria}
                    onChange={(e) =>
                        alterar({
                            ...dados,
                            categoria: Number(
                                e.target.value
                            ) as DadosChamado["categoria"],
                        })
                    }
                >
                    {categoriasChamado.map(({ codigo, nome }) => (
                        <option key={codigo} value={codigo}>
                            {nome}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chamado-campo">
                <label htmlFor={`${id}-prioridade`}>Prioridade</label>
                <select
                    id={`${id}-prioridade`}
                    value={dados.prioridade}
                    onChange={(e) =>
                        alterar({
                            ...dados,
                            prioridade: Number(
                                e.target.value
                            ) as DadosChamado["prioridade"],
                        })
                    }
                >
                    {prioridadesChamado.map(({ codigo, nome }) => (
                        <option key={codigo} value={codigo}>
                            {nome}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chamado-campo chamado-campo-completo">
                <label htmlFor={`${id}-descricao`}>Descrição</label>
                <textarea
                    id={`${id}-descricao`}
                    rows={6}
                    value={dados.descricao}
                    onChange={(e) =>
                        alterar({ ...dados, descricao: e.target.value })
                    }
                    placeholder="Descreva o problema com detalhes"
                />
            </div>
        </fieldset>
    );
}

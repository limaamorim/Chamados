import { useId } from "react";
import { categoriasChamado, prioridadesChamado, statusChamado } from "../../../utils/chamados";
import type { FiltrosChamados as Filtros } from "../../../utils/chamados";
import CampoPesquisa from "../../../components/ui/CampoPesquisa";
import Button from "../../../components/ui/Button";
import "./FiltrosChamados.css";

type Props = {
    filtros: Filtros;
    alterar: (campo: keyof Filtros, valor: string) => void;
    abrirNovoChamado: () => void;
};

export default function FiltrosChamados({ filtros, alterar, abrirNovoChamado }: Props) {
    const id = useId();
    const campos = [
        { campo: "status", titulo: "Status", todos: "Todos", opcoes: statusChamado },
        { campo: "prioridade", titulo: "Prioridade", todos: "Todas", opcoes: prioridadesChamado },
        { campo: "categoria", titulo: "Categoria", todos: "Todas", opcoes: categoriasChamado },
    ] as const;
    return (
        <div className="filtros-chamados">
            <div className="barra-acoes">
                <CampoPesquisa valor={filtros.pesquisa} aoAlterar={(valor) => alterar("pesquisa", valor)} placeholder="Pesquisar chamados..." />
                <Button onClick={abrirNovoChamado} icone="+">Novo chamado</Button>
            </div>
            <div className="filtros-chamados-campos">
                {campos.map(({ campo, titulo, todos, opcoes }) => (
                    <div key={campo}>
                        <label htmlFor={`${id}-${campo}`}>{titulo}</label>
                        <select id={`${id}-${campo}`} value={filtros[campo]} onChange={(e) => alterar(campo, e.target.value)}>
                            <option value="">{todos}</option>
                            {opcoes.map(({ codigo, nome }) => <option key={codigo} value={codigo}>{nome}</option>)}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}

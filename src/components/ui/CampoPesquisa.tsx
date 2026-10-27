import Icone from "./Icone";
import "./CampoPesquisa.css";

type CampoPesquisaProps = {
    valor: string;
    aoAlterar: (valor: string) => void;
    placeholder?: string;
};

function CampoPesquisa({
    valor,
    aoAlterar,
    placeholder = "Pesquisar...",
}: CampoPesquisaProps) {
    return (
        <div className="campo-pesquisa">
            <Icone nome="pesquisar" />

            <input
                type="search"
                aria-label={placeholder}
                placeholder={placeholder}
                value={valor}
                onChange={(evento) => aoAlterar(evento.target.value)}
            />
        </div>
    );
}

export default CampoPesquisa;

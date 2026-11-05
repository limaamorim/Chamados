// Exibe um campo de pesquisa cujo valor e alterações são controlados pela página.
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
            <span aria-hidden="true">⌕</span>

            {/* value mostra o estado recebido; onChange devolve o texto digitado para o componente pai. */}
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

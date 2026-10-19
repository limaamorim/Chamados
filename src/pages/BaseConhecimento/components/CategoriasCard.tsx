import "./CategoriasCard.css";

type Categoria = {
    nome: string;
    icone: string;
};

type CategoriasCardProps = {
    categorias: Categoria[];
    categoriaSelecionada: string;
    aoSelecionar: (categoria: string) => void;
    totalArtigos: number;
};

function CategoriasCard({
    categorias,
    categoriaSelecionada,
    aoSelecionar,
    totalArtigos,
}: CategoriasCardProps) {
    return (
        <section className="base-secao">
            <div className="base-titulo-secao">
                <h2>Explore por categoria</h2>
                <span>{totalArtigos} artigos</span>
            </div>

            <div className="base-categorias">
                {categorias.map((categoria) => (
                    <button
                        type="button"
                        key={categoria.nome}
                        className={
                            categoriaSelecionada === categoria.nome
                                ? "base-categoria ativa"
                                : "base-categoria"
                        }
                        onClick={() => aoSelecionar(categoria.nome)}
                    >
                        <span>{categoria.icone}</span>
                        <strong>{categoria.nome}</strong>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default CategoriasCard;

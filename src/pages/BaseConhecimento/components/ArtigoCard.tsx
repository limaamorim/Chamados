import type { Artigo } from "../../../data/baseConhecimento";
import "./ArtigoCard.css";

type ArtigoCardProps = {
    artigo: Artigo;
    aoAbrir: (artigo: Artigo) => void;
};

function ArtigoCard({ artigo, aoAbrir }: ArtigoCardProps) {
    return (
        <button
            type="button"
            className="artigo-card"
            onClick={() => aoAbrir(artigo)}
        >
            <div
                className={`artigo-icone categoria-${artigo.categoria
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll("ê", "e")
                    .replaceAll("í", "i")
                    .replaceAll("ã", "a")}`}
            >
                {artigo.icone}
            </div>

            <div className="artigo-card-conteudo">
                <span className="artigo-categoria">{artigo.categoria}</span>

                <h3>{artigo.titulo}</h3>

                <p>{artigo.descricao}</p>

                <div className="artigo-card-rodape">
                    {artigo.tempoLeitura > 0 && <span>{artigo.tempoLeitura} min de leitura</span>}
                </div>
            </div>

            <span className="artigo-seta" aria-hidden="true">
                ›
            </span>
        </button>
    );
}

export default ArtigoCard;

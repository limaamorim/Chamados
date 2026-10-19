
import "./ArtigoCard.css";

export type Artigo = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    icone: string;
    tempoLeitura: number;
    conteudo: string[];
    destaque?: boolean;
    visualizacoes: number;
};

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
            <div className={`artigo-icone categoria-${artigo.categoria
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll("ê", "e")
                .replaceAll("í", "i")
                .replaceAll("ã", "a")}`}
            >
                {artigo.icone}
            </div>

            <div className="artigo-card-conteudo">
                <span className="artigo-categoria">
                    {artigo.categoria}
                </span>

                <h3>{artigo.titulo}</h3>

                <p>{artigo.descricao}</p>

                <div className="artigo-card-rodape">
                    <span>{artigo.tempoLeitura} min de leitura</span>
                    <span className="artigo-visualizacoes">
                        {artigo.visualizacoes} visualizações
                    </span>
                </div>
            </div>

            <span className="artigo-seta" aria-hidden="true">›</span>
        </button>
    );
}

export default ArtigoCard;

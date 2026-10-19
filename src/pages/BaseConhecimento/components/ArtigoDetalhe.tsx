import type { Artigo } from "../../../data/baseConhecimento";
import Button from "../../../components/ui/Button";
import "./ArtigoDetalhe.css";

type Props = {
    artigo: Artigo;
    voltar: () => void;
    abrirNovoChamado: () => void;
};

// Visualização de um artigo, usada somente pela Base de Conhecimento.
export default function ArtigoDetalhe({
    artigo,
    voltar,
    abrirNovoChamado,
}: Props) {
    return (
        <article className="base-artigo-detalhe">
            <Button variante="secundario" onClick={voltar}>
                ← Voltar para os artigos
            </Button>
            <span className="base-etiqueta">{artigo.categoria}</span>
            <h2>{artigo.titulo}</h2>
            <p className="base-artigo-descricao">{artigo.descricao}</p>
            <div className="base-passo-a-passo">
                <h3>Como resolver</h3>
                <ol>
                    {artigo.conteudo.map((passo, indice) => (
                        <li key={indice}>{passo}</li>
                    ))}
                </ol>
            </div>
            <Button icone="+" onClick={abrirNovoChamado}>
                Criar chamado
            </Button>
        </article>
    );
}

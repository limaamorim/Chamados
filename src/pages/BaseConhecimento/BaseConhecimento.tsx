
import { useMemo, useState } from "react";
import ArtigoCard from "../../components/BaseConhecimento/ArtigoCard";
import type { Artigo } from "../../components/BaseConhecimento/ArtigoCard";
import Header from "../../components/ui/Header";
import CampoPesquisa from "../../components/ui/CampoPesquisa";
import CategoriasCard from "../../components/BaseConhecimento/CategoriasCard";
import BotaoNovoChamado from "../../components/ui/BotaoNovoChamado";
import { artigos, categorias } from "../../data/Data";
import "./BaseConhecimento.css";

type BaseConhecimentoProps = {
    abrirNovoChamado: () => void;
};


function BaseConhecimento({
    abrirNovoChamado
}: BaseConhecimentoProps) {
    const [busca, setBusca] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
    const [artigoSelecionado, setArtigoSelecionado] = useState<Artigo | null>(null);

    const artigosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");

        return artigos.filter((artigo) => {
            const correspondeCategoria =
                categoriaSelecionada === "Todos" ||
                artigo.categoria === categoriaSelecionada;

            const textoArtigo = [
                artigo.titulo,
                artigo.descricao,
                artigo.categoria,
                ...artigo.conteudo
            ].join(" ").toLocaleLowerCase("pt-BR");

            return correspondeCategoria && textoArtigo.includes(termo);
        });
    }, [busca, categoriaSelecionada]);

    const artigosDestaque = artigos.filter((artigo) => artigo.destaque);

    function selecionarCategoria(categoria: string) {
        setCategoriaSelecionada(categoria);
        setArtigoSelecionado(null);
    }

    return (
        <section className="base-conhecimento">

            <Header
                titulo="Base de conhecimento"
                descricao="Encontre orientações e soluções para os problemas mais comuns do dia a dia."
            />

            <div>
                <CampoPesquisa
                    valor={busca}
                    aoAlterar={(valor) => {
                        setBusca(valor);
                        setArtigoSelecionado(null);
                    }}
                    placeholder="O que você precisa resolver?"
                />

                {busca && (
                    <button
                        type="button"
                        onClick={() => {
                            setBusca("");
                            setArtigoSelecionado(null);
                        }}
                    >
                        Limpar
                    </button>
                )}
            </div> <br />

            {artigoSelecionado ? (
                <article className="base-artigo-detalhe">
                    <button
                        type="button"
                        className="base-voltar"
                        onClick={() => setArtigoSelecionado(null)}
                    >
                        ← Voltar para os artigos
                    </button>

                    <span className="base-etiqueta">
                        {artigoSelecionado.categoria}
                    </span>

                    <h2>{artigoSelecionado.titulo}</h2>
                    <p className="base-artigo-descricao">
                        {artigoSelecionado.descricao}
                    </p>

                    <div className="base-passo-a-passo">
                        <h3>Como resolver</h3>
                        <ol>
                            {artigoSelecionado.conteudo.map((passo, indice) => (
                                <li key={indice}>{passo}</li>
                            ))}
                        </ol>
                    </div>

                    <BotaoNovoChamado
                        aoClicar={abrirNovoChamado}
                        texto=" Criar chamado"
                        variante="principal"
                    />
                </article>
            ) : (
                <>
                    <CategoriasCard
                        categorias={categorias}
                        categoriaSelecionada={categoriaSelecionada}
                        aoSelecionar={selecionarCategoria}
                        totalArtigos={artigos.length}
                    />

                    {categoriaSelecionada === "Todos" && !busca && (
                        <section className="base-secao">
                            <div className="base-titulo-secao">
                                <h2>Artigos em destaque</h2>
                            </div>

                            <div className="base-lista-artigos base-destaques">
                                {artigosDestaque.map((artigo) => (
                                    <ArtigoCard
                                        key={artigo.id}
                                        artigo={artigo}
                                        aoAbrir={setArtigoSelecionado}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="base-secao">
                        <div className="base-titulo-secao">
                            <h2>
                                {busca
                                    ? "Resultados da pesquisa"
                                    : categoriaSelecionada === "Todos"
                                        ? "Todos os artigos"
                                        : categoriaSelecionada}
                            </h2>
                            <span>{artigosFiltrados.length} encontrados</span>
                        </div>

                        {artigosFiltrados.length > 0 ? (
                            <div className="base-lista-artigos">
                                {artigosFiltrados.map((artigo) => (
                                    <ArtigoCard
                                        key={artigo.id}
                                        artigo={artigo}
                                        aoAbrir={setArtigoSelecionado}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="base-vazio">
                                <span aria-hidden="true">⌕</span>
                                <h3>Nenhum artigo encontrado</h3>
                                <p>
                                    Tente outro termo ou selecione uma categoria diferente.
                                </p>
                                <BotaoNovoChamado
                                    aoClicar={abrirNovoChamado}
                                    texto="Criar chamado"
                                    variante="principal"
                                />
                            </div>
                        )}
                    </section>

                    <aside className="base-ajuda-final">
                        <div>
                            <strong>Não encontrou o que precisava?</strong>
                            <p>Entre em contato com a equipe de atendimento.</p>
                        </div>
                        <BotaoNovoChamado
                            aoClicar={abrirNovoChamado}
                            texto="Criar chamado"
                            variante="principal"
                        />
                    </aside>
                </>
            )}
        </section>
    );
}

export default BaseConhecimento;

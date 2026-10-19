import { useMemo, useState } from "react";
import ArtigoCard from "./components/ArtigoCard";
import type { Artigo } from "../../data/baseConhecimento";
import Pagina from "../../components/layout/Pagina";
import ArtigoDetalhe from "./components/ArtigoDetalhe";
import CampoPesquisa from "../../components/ui/CampoPesquisa";
import CategoriasCard from "./components/CategoriasCard";
import Button from "../../components/ui/Button";
import { artigos, categorias } from "../../data/baseConhecimento";
import "./BaseConhecimento.css";

type BaseConhecimentoProps = {
    abrirNovoChamado: () => void;
};

export default function BaseConhecimento({
    abrirNovoChamado,
}: BaseConhecimentoProps) {
    // Estados locais da tela: pesquisa, categoria e artigo aberto.
    const [busca, setBusca] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
    const [artigoSelecionado, setArtigoSelecionado] = useState<Artigo | null>(
        null
    );

    // Filter: combina categoria e texto nos artigos locais. useMemo reaproveita o resultado enquanto os filtros não mudam.
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
                ...artigo.conteudo,
            ]
                .join(" ")
                .toLocaleLowerCase("pt-BR");

            return correspondeCategoria && textoArtigo.includes(termo);
        });
    }, [busca, categoriaSelecionada]);

    const artigosDestaque = artigos.filter((artigo) => artigo.destaque);

    function selecionarCategoria(categoria: string) {
        setCategoriaSelecionada(categoria);
        setArtigoSelecionado(null);
    }

    // Interface da página.
    return (
        <Pagina
            className="base-conhecimento"
            titulo="Base de conhecimento"
            descricao="Encontre orientações e soluções para os problemas mais comuns do dia a dia."
        >
            <div className="base-barra-pesquisa">
                <CampoPesquisa
                    valor={busca}
                    aoAlterar={(valor) => {
                        setBusca(valor);
                        setArtigoSelecionado(null);
                    }}
                    placeholder="O que você precisa resolver?"
                />

                {busca && (
                    <Button
                        variante="secundario"
                        onClick={() => {
                            setBusca("");
                            setArtigoSelecionado(null);
                        }}
                    >
                        Limpar
                    </Button>
                )}
            </div>

            {artigoSelecionado ? (
                <ArtigoDetalhe
                    artigo={artigoSelecionado}
                    voltar={() => setArtigoSelecionado(null)}
                    abrirNovoChamado={abrirNovoChamado}
                />
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
                                    Tente outro termo ou selecione uma categoria
                                    diferente.
                                </p>
                                <Button icone="+" onClick={abrirNovoChamado}>
                                    Criar chamado
                                </Button>
                            </div>
                        )}
                    </section>

                    <aside className="base-ajuda-final">
                        <div>
                            <strong>Não encontrou o que precisava?</strong>
                            <p>Entre em contato com a equipe de atendimento.</p>
                        </div>
                        <Button icone="+" onClick={abrirNovoChamado}>
                            Criar chamado
                        </Button>
                    </aside>
                </>
            )}
        </Pagina>
    );
}

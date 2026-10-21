import { useEffect, useMemo, useState } from "react";
import ArtigoCard from "./components/ArtigoCard";
import type { Artigo } from "../../data/baseConhecimento";
import Pagina from "../../components/layout/Pagina";
import ArtigoDetalhe from "./components/ArtigoDetalhe";
import CampoPesquisa from "../../components/ui/CampoPesquisa";
import CategoriasCard from "./components/CategoriasCard";
import Button from "../../components/ui/Button";
import { listarArtigos } from "../../services/baseConhecimentoService";
import "./BaseConhecimento.css";

type BaseConhecimentoProps = {
    abrirNovoChamado: () => void;
};

export default function BaseConhecimento({
    abrirNovoChamado,
}: BaseConhecimentoProps) {
    const [artigos, setArtigos] = useState<Artigo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarArtigos()
            .then((dados) => {
                // setArtigos(dados) → ideia de ClearCollect: substitui a lista local inteira.
                if (ativo) setArtigos(dados);
            })
            .catch((error: unknown) => {
                if (ativo) setErro(error instanceof Error ? error.message : "Não foi possível carregar os artigos.");
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });
        return () => { ativo = false; };
    }, []);

    // new Set remove categorias repetidas: lembra Distinct, não Set do Power Apps.
    // map extrai a categoria; filter tira "Todos" para não duplicar a opção fixa.
    const categorias = [
        { nome: "Todos", icone: "▦" },
        ...Array.from(new Set(artigos.map((artigo) => artigo.categoria)))
            .filter((nome) => nome !== "Todos")
            .map((nome) => ({ nome, icone: "▤" })),
    ];

    // useState + setters → comportamento parecido com UpdateContext nesta tela.
    // Guarda pesquisa, categoria e o próprio artigo escolhido (sem buscar com LookUp).
    const [busca, setBusca] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
    const [artigoSelecionado, setArtigoSelecionado] = useState<Artigo | null>(
        null
    );

    // filter() → Filter: combina categoria e texto nos artigos carregados.
    // useMemo reaproveita o resultado enquanto artigos, busca e categoria não mudam.
    // trim() lembra TrimEnds; toLocaleLowerCase() lembra Lower; includes() lembra in.
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
    }, [artigos, busca, categoriaSelecionada]);

    // slice(0, 3) → FirstN(artigos, 3): copia até os três primeiros, sem alterar artigos.
    // Não há ordenação adicional: usa a ordem recebida do SharePoint.
    const artigosDestaque = artigos.slice(0, 3);

    function selecionarCategoria(categoria: string) {
        setCategoriaSelecionada(categoria);
        setArtigoSelecionado(null);
    }

    // Interface da página.
    return (
        <Pagina
            className="base-conhecimento"
            erro={erro}
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

            {carregando && <p role="status">Carregando artigos...</p>}
            {!carregando && !erro && (artigoSelecionado ? (
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

                    {categoriaSelecionada === "Todos" && !busca && artigosDestaque.length > 0 && (
                        <section className="base-secao">
                            <div className="base-titulo-secao">
                                <h2>Explore os artigos</h2>
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
            ))}
        </Pagina>
    );
}

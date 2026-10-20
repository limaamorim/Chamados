import "./Paginacao.css";

type Props = {
    pagina: number;
    totalPaginas: number;
    totalItens: number;
    aoMudar: (pagina: number) => void;
};

export default function Paginacao({ pagina, totalPaginas, totalItens, aoMudar }: Props) {
    // Uma janela de até cinco páginas evita dezenas de botões em listas grandes.
    const inicio = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
    const paginas = Array.from(
        { length: Math.min(5, totalPaginas) },
        (_, indice) => inicio + indice
    );
    return (
        <div className="paginacao-chamados">
            <span aria-live="polite">
                {totalItens} chamado(s) encontrado(s)
                {totalItens > 0 && ` · Página ${pagina} de ${totalPaginas}`}
            </span>
            {totalPaginas > 1 && (
                <nav aria-label="Paginação de chamados">
                    <button type="button" aria-label="Página anterior"
                        disabled={pagina === 1} onClick={() => aoMudar(pagina - 1)}>
                        ‹
                    </button>
                    {paginas.map((numero) => (
                        <button type="button" key={numero}
                            aria-label={`Página ${numero}`}
                            aria-current={pagina === numero ? "page" : undefined}
                            onClick={() => aoMudar(numero)}>
                            {numero}
                        </button>
                    ))}
                    <button type="button" aria-label="Próxima página"
                        disabled={pagina === totalPaginas} onClick={() => aoMudar(pagina + 1)}>
                        ›
                    </button>
                </nav>
            )}
        </div>
    );
}

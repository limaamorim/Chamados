// Um único componente mantém tamanho e traço dos ícones consistentes, sem dependências.
const desenhos = {
    chamados: "M4 4h16v16H4z M8 9h8 M8 13h6",
    adicionar: "M12 5v14 M5 12h14",
    livro: "M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4z M12 6v15",
    grafico: "M4 4v16h16 M8 16v-5 M12 16V7 M16 16V9",
    menu: "M4 6h16 M4 12h16 M4 18h16",
    relogio: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
    verificar: "M5 12l4 4L19 6",
    visualizar: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    editar: "M4 16v4h4L20 8l-4-4z M13 7l4 4",
    excluir: "M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7",
    iniciar: "M8 5l11 7-11 7z",
    pesquisar: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6",
};
export type NomeIcone = keyof typeof desenhos;

export default function Icone({ nome }: { nome: NomeIcone }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d={desenhos[nome]} />
        </svg>
    );
}

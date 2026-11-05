// Define o formato de um artigo usado pelo serviço SharePoint e pela interface.
export type Artigo = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    icone: string;
    tempoLeitura: number;
    conteudo: string[];
};


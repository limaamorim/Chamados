
import type { Artigo } from "../components/BaseConhecimento/ArtigoCard";

export const categorias = [
    { nome: "Todos", icone: "▦" },
    { nome: "Hardware", icone: "▣" },
    { nome: "Software", icone: "▤" },
    { nome: "Acesso e contas", icone: "♙" },
    { nome: "Rede e internet", icone: "⌁" },
    { nome: "Segurança", icone: "◇" },
];

export const artigos: Artigo[] = [
    {
        id: 1,
        titulo: "Como configurar o e-mail corporativo",
        descricao: "Aprenda a configurar e acessar seu e-mail de trabalho.",
        categoria: "Software",
        icone: "✉",
        tempoLeitura: 3,
        visualizacoes: 248,
        destaque: true,
        conteudo: [
            "Verifique se você possui suas credenciais corporativas.",
            "Abra o Outlook no computador ou no navegador.",
            "Informe seu e-mail corporativo e siga as instruções de autenticação.",
            "Se for solicitada uma verificação adicional, conclua o processo de segurança.",
            "Caso o acesso continue falhando, registre um chamado informando a mensagem de erro."
        ]
    },
    {
        id: 2,
        titulo: "Como solicitar acesso a um sistema",
        descricao: "Veja como solicitar permissão para utilizar sistemas internos.",
        categoria: "Acesso e contas",
        icone: "♙",
        tempoLeitura: 2,
        visualizacoes: 196,
        destaque: true,
        conteudo: [
            "Identifique o sistema ao qual você precisa ter acesso.",
            "Informe a finalidade do acesso e o tipo de permissão necessária.",
            "Abra um chamado na categoria de acesso e contas.",
            "Aguarde a análise e a aprovação do responsável pelo sistema."
        ]
    },
    {
        id: 3,
        titulo: "Problemas de conexão com a VPN",
        descricao: "Confira as verificações iniciais para problemas de conexão.",
        categoria: "Rede e internet",
        icone: "⌁",
        tempoLeitura: 4,
        visualizacoes: 312,
        destaque: true,
        conteudo: [
            "Verifique se sua conexão com a internet está funcionando.",
            "Confirme se você está utilizando o aplicativo de VPN autorizado pela empresa.",
            "Confira se suas credenciais corporativas estão corretas.",
            "Se o erro persistir, anote a mensagem apresentada e abra um chamado."
        ]
    },
    {
        id: 4,
        titulo: "Como redefinir minha senha",
        descricao: "Entenda como recuperar o acesso à sua conta corporativa.",
        categoria: "Acesso e contas",
        icone: "♙",
        tempoLeitura: 3,
        visualizacoes: 421,
        conteudo: [
            "Acesse o portal oficial de recuperação de conta da sua organização.",
            "Siga as etapas de verificação de identidade.",
            "Crie uma senha conforme as regras de segurança apresentadas.",
            "Nunca compartilhe sua senha ou códigos de autenticação."
        ]
    },
    {
        id: 5,
        titulo: "O que fazer quando o computador fica lento",
        descricao: "Veja verificações básicas para melhorar o desempenho.",
        categoria: "Hardware",
        icone: "▣",
        tempoLeitura: 4,
        visualizacoes: 175,
        conteudo: [
            "Feche os programas que não estão sendo utilizados.",
            "Salve seu trabalho antes de reiniciar o computador.",
            "Verifique se há atualizações pendentes pelos canais autorizados.",
            "Se o problema continuar, abra um chamado descrevendo quando ele começou."
        ]
    },
    {
        id: 6,
        titulo: "Boas práticas de segurança digital",
        descricao: "Aprenda a reconhecer riscos e proteger suas informações.",
        categoria: "Segurança",
        icone: "◇",
        tempoLeitura: 5,
        visualizacoes: 153,
        conteudo: [
            "Não clique em links suspeitos recebidos por e-mail ou mensagem.",
            "Nunca compartilhe senhas ou códigos de autenticação.",
            "Utilize apenas ferramentas e aplicativos aprovados pela empresa.",
            "Reporte mensagens suspeitas pelos canais oficiais de segurança."
        ]
    },
    {
        id: 7,
        titulo: "Como instalar um aplicativo autorizado",
        descricao: "Consulte as orientações para instalar ferramentas de trabalho.",
        categoria: "Software",
        icone: "▤",
        tempoLeitura: 3,
        visualizacoes: 121,
        conteudo: [
            "Verifique se o aplicativo está autorizado para uso corporativo.",
            "Utilize o catálogo ou portal de instalação disponibilizado pela empresa.",
            "Siga as instruções de instalação e autenticação.",
            "Se precisar de permissão administrativa, solicite suporte."
        ]
    }
];

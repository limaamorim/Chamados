// Controla o tema claro/escuro e salva a preferência no navegador.
import { useEffect, useState } from "react";

type Tema = "claro" | "escuro";

// O HTML aplica a preferência antes da primeira pintura; o estado mantém o botão sincronizado.
export function useTema() {
    // A função inicial de useState lê a preferência salva uma vez por montagem; sem preferência escura, começa no claro.
    const [tema, setTema] = useState<Tema>(() => {
        try {
            return localStorage.getItem("caze-tema") === "escuro" ? "escuro" : "claro";
        } catch {
            return document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
        }
    });

    // Executa ao montar e sempre que tema muda: o atributo data-tema ativa as cores do CSS e localStorage guarda a escolha.
    useEffect(() => {
        document.documentElement.dataset.tema = tema;
        try {
            localStorage.setItem("caze-tema", tema);
        } catch {
            // A alternância continua funcionando se o navegador bloquear o armazenamento.
        }
    }, [tema]);

    // O setter recebe o valor atual e devolve o tema oposto; o React então atualiza o botão e a página.
    function alternarTema() {
        setTema((atual) => atual === "claro" ? "escuro" : "claro");
    }

    return { tema, alternarTema };
}

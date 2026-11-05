import { useEffect, useState } from "react";

type Tema = "claro" | "escuro";

// O HTML aplica a preferência antes da primeira pintura; o estado mantém o botão sincronizado.
export function useTema() {
    const [tema, setTema] = useState<Tema>(() => {
        try {
            return localStorage.getItem("caze-tema") === "escuro" ? "escuro" : "claro";
        } catch {
            return document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
        }
    });

    useEffect(() => {
        document.documentElement.dataset.tema = tema;
        try {
            localStorage.setItem("caze-tema", tema);
        } catch {
            // A alternância continua funcionando se o navegador bloquear o armazenamento.
        }
    }, [tema]);

    function alternarTema() {
        setTema((atual) => atual === "claro" ? "escuro" : "claro");
    }

    return { tema, alternarTema };
}

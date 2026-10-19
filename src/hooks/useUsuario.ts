import { useEffect, useState } from "react";
import { getContext } from "@microsoft/power-apps/app";

// Isola a leitura do contexto do Power Apps da apresentação do cabeçalho.
export function useUsuario() {
    const [nomeUsuario, setNomeUsuario] = useState("Usuário");
    useEffect(() => {
        let ativo = true;
        getContext()
            .then((contexto) => {
                if (ativo && contexto.user.fullName)
                    setNomeUsuario(contexto.user.fullName);
            })
            .catch((error: unknown) =>
                console.error("Erro ao buscar usuário:", error)
            );
        return () => {
            ativo = false;
        };
    }, []);
    return nomeUsuario;
}

// Obtém o nome do usuário no contexto do Power Apps para o cabeçalho.
import { useEffect, useState } from "react";
import { getContext } from "@microsoft/power-apps/app";

// Isola a leitura do contexto do Power Apps da apresentação do cabeçalho.
export function useUsuario() {
    // Mostra um nome inicial enquanto a leitura assíncrona do usuário ainda não terminou.
    const [nomeUsuario, setNomeUsuario] = useState("Usuário");
    // Consulta o contexto ao montar; a limpeza impede que uma resposta atrasada altere um componente já desmontado.
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

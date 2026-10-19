
import "./BotaoNovoChamado.css";

type BotaoNovoChamadoProps = {
    aoClicar: () => void;
    texto?: string;
    disabled?: boolean;
    variante?: "padrao" | "principal";
};

function BotaoNovoChamado({
    aoClicar,
    texto = "Novo chamado",
    disabled = false,
    variante = "padrao",
}: BotaoNovoChamadoProps) {
    return (
        <button
            type="button"
            className={
                variante === "principal"
                    ? "botao-novo-principal"
                    : "botao-novo"
            }
            onClick={aoClicar}
            disabled={disabled}
        >
            <span>+</span>
            {texto}
        </button>
    );
}

export default BotaoNovoChamado;

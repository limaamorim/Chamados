import Pagina from "../../components/layout/Pagina";
import Button from "../../components/ui/Button";
import ChamadosTable from "../Dashboard/components/ChamadosTable";
import type { AcoesChamados } from "../Dashboard/components/ChamadosTable";
import type { EstadoChamados } from "../../hooks/useChamados";

type NovoChamadoProps = {
    dados: EstadoChamados;
    acoes: AcoesChamados;
    abrirNovoChamado: () => void;
};

// A tabela é a mesma usada no Dashboard; o formulário só é montado dentro do modal.
export default function NovoChamado({ dados, acoes, abrirNovoChamado }: NovoChamadoProps) {
    return (
        <Pagina
            titulo="Novo chamado"
            descricao="Consulte os chamados e cadastre novas solicitações."
            mensagem={dados.mensagem}
            erro={dados.erro}
            aviso={dados.aviso}
        >
            {dados.erro && (
                <Button variante="secundario" onClick={dados.recarregar} disabled={dados.carregando}>
                    Tentar carregar novamente
                </Button>
            )}
            {dados.carregando && <p role="status">Atualizando chamados...</p>}
            <ChamadosTable
                paginacao
                chamados={dados.chamados}
                carregando={dados.carregando}
                erroCarregamento={!!dados.erro}
                abrirNovoChamado={abrirNovoChamado}
                {...acoes}
            />
        </Pagina>
    );
}

// Monta a página de listagem com a tabela compartilhada e o acesso à criação.
import Pagina from "../../components/layout/Pagina";
import ChamadosTable from "../../components/chamados/ChamadosTable";
import type { AcoesChamados } from "../../components/chamados/ChamadosTable";
import type { EstadoChamados } from "../../hooks/useChamados";

type ChamadosProps = {
    dados: EstadoChamados;
    acoes: AcoesChamados;
    abrirNovoChamado: () => void;
};

// A tabela é a mesma usada no Dashboard; o formulário só é montado dentro do modal.
export default function Chamados({ dados, acoes, abrirNovoChamado }: ChamadosProps) {
    return (
        <Pagina
            titulo="Novo chamado"
            descricao="Consulte os chamados e cadastre novas solicitações."
            mensagem={dados.mensagem}
            aviso={dados.aviso}
        >
            <ChamadosTable
                paginacao
                versao={dados.versao}
                recarregar={dados.recarregar}
                abrirNovoChamado={abrirNovoChamado}
                {...acoes}
            />
        </Pagina>
    );
}

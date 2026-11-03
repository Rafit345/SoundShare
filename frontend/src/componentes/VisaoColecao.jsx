// REP001 - Reproduzir Playlist ou Álbum: cabeçalho com as totalizações
// (quantidade de canções, duração total, plays) e a tabela de faixas

import { Link } from 'react-router-dom'
import { duracaoTotal, plural } from '../formatos'
import { usePlayer } from '../Player'
import Capa from './Capa'
import Icone from './Icone'
import TabelaFaixas from './TabelaFaixas'

export default function VisaoColecao({ rotulo, colecao, criador, linkEditar, vazio }) {
  const player = usePlayer()
  const cancoes = colecao.cancoes

  return (
    <>
      <header className="cabecalho-colecao">
        <Capa url={colecao.capa_url} titulo={colecao.nome} />
        <div>
          <p className="rotulo">{rotulo}</p>
          <h1>{colecao.nome}</h1>
          <p className="totais">
            <strong>{criador}</strong> • {plural(colecao.quantidade_cancoes, 'canção', 'canções')} •{' '}
            {duracaoTotal(colecao.duracao_total)} • {plural(colecao.total_reproducoes, 'play', 'plays')} totais
          </p>
          <div className="grupo-botoes">
            {/* sem canções não aparece o "Reproduzir tudo" */}
            {cancoes.length > 0 && (
              <button className="botao botao-primario botao-redondo" onClick={() => player.tocarLista(cancoes, 0)}>
                <Icone nome="play" /> Reproduzir tudo
              </button>
            )}
            {linkEditar && (
              <Link to={linkEditar} className="botao botao-redondo">
                <Icone nome="editar" /> Editar
              </Link>
            )}
          </div>
        </div>
      </header>

      {cancoes.length === 0 ? <p className="vazio">{vazio}</p> : <TabelaFaixas cancoes={cancoes} />}
    </>
  )
}

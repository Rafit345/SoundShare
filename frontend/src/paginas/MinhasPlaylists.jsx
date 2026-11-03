// Minhas Playlists: tela inicial do ouvinte (LOG001), ponto de partida do GPL001

import { Link } from 'react-router-dom'
import useDados from '../useDados'
import { duracaoTotal, plural } from '../formatos'
import Capa from '../componentes/Capa'
import Icone from '../componentes/Icone'

export default function MinhasPlaylists() {
  const { dados: playlists, carregando } = useDados('playlists/')

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Minhas Playlists</h1>
          <p className="subtitulo">Suas coleções de músicas.</p>
        </div>
        <Link to="/playlists/nova" className="botao botao-primario">
          <Icone nome="mais" /> Nova playlist
        </Link>
      </div>

      {carregando && <p className="carregando">Carregando...</p>}
      {playlists && (
        <section className="grade-cartoes">
          {playlists.map((playlist) => (
            <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="cartao-item">
              <Capa url={playlist.capa_url} tamanho="media" titulo={playlist.nome} />
              <h3>{playlist.nome}</h3>
              <p>
                {playlist.privada ? 'Particular' : 'Pública'} • {plural(playlist.quantidade_cancoes, 'canção', 'canções')} •{' '}
                {duracaoTotal(playlist.duracao_total)}
              </p>
            </Link>
          ))}
          <Link to="/playlists/nova" className="cartao-item cartao-novo">
            <span><Icone nome="mais" tamanho={28} /><br />Nova playlist</span>
          </Link>
        </section>
      )}
    </>
  )
}

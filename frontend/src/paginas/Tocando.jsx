// Tela de reprodução: faixa atual em destaque e fila de reprodução

import { Link } from 'react-router-dom'
import { minutosSegundos, plural } from '../formatos'
import { usePlayer } from '../Player'
import Icone from '../componentes/Icone'

export default function Tocando() {
  const player = usePlayer()

  if (!player.atual) {
    return (
      <p className="vazio">
        Nada tocando no momento. Escolha uma <Link to="/playlists">playlist</Link> ou
        um <Link to="/artistas">artista</Link>.
      </p>
    )
  }

  return (
    <div className="tela-tocando">
      <section className="faixa-atual">
        <div className="capa capa-vazia"><Icone nome="nota" tamanho={96} /></div>
        <h1>{player.atual.nome}</h1>
        <p className="artista">{player.atual.artista}</p>
        <p className="subtitulo">
          {plural(player.atual.total_reproducoes, 'play', 'plays')} • {player.atual.genero_musical}
        </p>

        <div className="progresso">
          <span>{minutosSegundos(player.tempo)}</span>
          <input type="range" min="0" max={player.duracao || 0} step="0.1" value={player.tempo}
            onChange={(e) => player.buscar(Number(e.target.value))} aria-label="Progresso da faixa" />
          <span>{minutosSegundos(player.duracao)}</span>
        </div>

        <div className="botoes-player">
          <button className="botao-icone" title="Anterior" onClick={player.anterior}>
            <Icone nome="anterior" tamanho={24} />
          </button>
          <button className="botao-play grande" title={player.tocando ? 'Pausar' : 'Tocar'} onClick={player.alternar}>
            <Icone nome={player.tocando ? 'pause' : 'play'} tamanho={32} />
          </button>
          <button className="botao-icone" title="Próxima" onClick={player.proxima}>
            <Icone nome="proxima" tamanho={24} />
          </button>
        </div>
      </section>

      <aside className="cartao">
        <h2>Fila de reprodução</h2>
        <p className="rotulo">Próximas músicas</p>
        <ul className="fila">
          {player.fila.map((cancao, i) => (
            <li key={`${cancao.id}-${i}`}>
              <button className={i === player.indice ? 'atual' : ''} onClick={() => player.pularPara(i)}>
                <div>
                  <strong>{cancao.nome}</strong>
                  <span>{cancao.artista}</span>
                </div>
                {i === player.indice
                  ? <span className="tocando-agora">TOCANDO</span>
                  : <span>{minutosSegundos(cancao.duracao_segundos)}</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

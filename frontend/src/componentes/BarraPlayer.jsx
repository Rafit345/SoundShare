// Barra do player fixa no rodapé, aparece quando alguma canção foi tocada

import { Link } from 'react-router-dom'
import { minutosSegundos } from '../formatos'
import { usePlayer } from '../Player'
import Icone from './Icone'

export default function BarraPlayer() {
  const player = usePlayer()
  if (!player.atual) return null

  return (
    <footer className="barra-player">
      <Link to="/tocando" className="barra-faixa" title="Abrir tela de reprodução">
        <div className="capa capa-mini capa-vazia"><Icone nome="nota" /></div>
        <div>
          <strong>{player.atual.nome}</strong>
          <span>{player.atual.artista}</span>
        </div>
      </Link>

      <div className="barra-controles">
        <div className="botoes-player">
          <button className="botao-icone" title="Anterior" onClick={player.anterior}>
            <Icone nome="anterior" />
          </button>
          <button className="botao-play" title={player.tocando ? 'Pausar' : 'Tocar'} onClick={player.alternar}>
            <Icone nome={player.tocando ? 'pause' : 'play'} />
          </button>
          <button className="botao-icone" title="Próxima" onClick={player.proxima}>
            <Icone nome="proxima" />
          </button>
        </div>
        <div className="progresso">
          <span>{minutosSegundos(player.tempo)}</span>
          <input
            type="range"
            min="0"
            max={player.duracao || 0}
            step="0.1"
            value={player.tempo}
            onChange={(e) => player.buscar(Number(e.target.value))}
            aria-label="Progresso da faixa"
          />
          <span>{minutosSegundos(player.duracao)}</span>
        </div>
      </div>

      <div className="barra-volume">
        <Icone nome="volume" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={player.volume}
          onChange={(e) => player.mudarVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </footer>
  )
}

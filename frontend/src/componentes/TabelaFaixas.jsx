// Listagem multidimensional das canções (REP001): título, artista, álbum,
// gênero, plays e duração, com play em cada linha

import { minutosSegundos, numero } from '../formatos'
import { usePlayer } from '../Player'
import Icone from './Icone'

export default function TabelaFaixas({ cancoes, aoRemover, mostrarAlbum = true }) {
  const player = usePlayer()

  return (
    <div className="tabela-container">
      <table className="tabela-faixas">
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th>Título</th>
            <th>Artista</th>
            {mostrarAlbum && <th className="col-opcional">Álbum</th>}
            <th className="col-opcional">Gênero</th>
            <th>Plays</th>
            <th className="col-dur">Duração</th>
            {aoRemover && <th className="col-acao"></th>}
          </tr>
        </thead>
        <tbody>
          {cancoes.map((cancao, i) => {
            const estaTocando = player.atual?.id === cancao.id
            return (
              <tr key={cancao.id} className={estaTocando ? 'tocando' : ''}>
                <td className="col-num">
                  <button
                    className="botao-play-linha"
                    title="Play"
                    onClick={() => player.tocarLista(cancoes, i)}
                  >
                    <span className="numero-faixa">{i + 1}</span>
                    <Icone nome="play" tamanho={14} />
                  </button>
                </td>
                <td className="titulo-faixa">{cancao.nome}</td>
                <td>{cancao.artista}</td>
                {mostrarAlbum && <td className="col-opcional">{cancao.album_de_origem || '—'}</td>}
                <td className="col-opcional">{cancao.genero_musical}</td>
                <td>{numero(cancao.total_reproducoes)}</td>
                <td className="col-dur">{minutosSegundos(cancao.duracao_segundos)}</td>
                {aoRemover && (
                  <td className="col-acao">
                    <button className="botao-icone" title="Remover" onClick={() => aoRemover(cancao)}>
                      <Icone nome="fechar" tamanho={16} />
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

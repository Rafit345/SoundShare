// Grade de álbuns com capa, nome, quantidade de canções e duração total (CPA001)

import { Link } from 'react-router-dom'
import { duracaoTotal, plural } from '../formatos'
import Capa from './Capa'

export default function GradeAlbuns({ albuns, mensagemVazio = 'Nenhum álbum publicado' }) {
  if (albuns.length === 0) {
    return <p className="vazio">{mensagemVazio}</p>
  }
  return (
    <section className="grade-cartoes">
      {albuns.map((album) => (
        <Link key={album.id} to={`/albuns/${album.id}`} className="cartao-item">
          <Capa url={album.capa_url} tamanho="media" titulo={album.nome} />
          <h3>{album.nome}</h3>
          <p>{plural(album.quantidade_cancoes, 'canção', 'canções')} • {duracaoTotal(album.duracao_total)}</p>
        </Link>
      ))}
    </section>
  )
}

// Tela do álbum: reprodução das canções (REP001)

import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../Autenticacao'
import useDados from '../useDados'
import VisaoColecao from '../componentes/VisaoColecao'

export default function Album() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { dados: album, erro, carregando } = useDados(`albuns/${id}/`)

  if (carregando) return <p className="carregando">Carregando...</p>
  if (erro) return <p className="vazio">Álbum não encontrado.</p>

  return (
    <VisaoColecao
      rotulo="Álbum"
      colecao={album}
      criador={<Link to={`/artistas/${album.pagina_artista}`}>{album.artista}</Link>}
      linkEditar={album.usuario === usuario.id ? `/albuns/${album.id}/editar` : null}
      vazio="Este álbum ainda não possui canções"
    />
  )
}

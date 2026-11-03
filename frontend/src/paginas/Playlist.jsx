// Tela da playlist: reprodução das canções (REP001)

import { useParams } from 'react-router-dom'
import { mensagemDeErro } from '../api'
import { useAuth } from '../Autenticacao'
import useDados from '../useDados'
import Mensagem from '../componentes/Mensagem'
import VisaoColecao from '../componentes/VisaoColecao'

export default function Playlist() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { dados: playlist, erro, carregando } = useDados(`playlists/${id}/`)

  if (carregando) return <p className="carregando">Carregando...</p>
  // playlist privada de outro usuário: acesso negado (REP001, fluxo alternativo)
  if (erro?.status === 403) return <Mensagem>{mensagemDeErro(erro)}</Mensagem>
  if (erro) return <p className="vazio">Playlist não encontrada.</p>

  const ehDono = playlist.usuario === usuario.id

  return (
    <VisaoColecao
      rotulo={playlist.privada ? 'Playlist particular' : 'Playlist pública'}
      colecao={playlist}
      criador={playlist.criador}
      // quem não criou a playlist só pode ouvir (GPL001)
      linkEditar={ehDono ? `/playlists/${playlist.id}/editar` : null}
      vazio="Esta playlist ainda não possui canções"
    />
  )
}

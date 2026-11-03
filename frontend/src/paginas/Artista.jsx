// CPA001 - Consultar Página de Artista (visão pública, id do artista na URL)

import { useParams } from 'react-router-dom'
import useDados from '../useDados'
import { numero } from '../formatos'
import GradeAlbuns from '../componentes/GradeAlbuns'

export default function Artista() {
  const { id } = useParams()
  const { dados: artista, erro, carregando } = useDados(`artistas/${id}/`)

  if (carregando) return <p className="carregando">Carregando...</p>
  if (erro?.status === 404) return <p className="vazio">Artista não encontrado</p>
  if (erro) return <p className="vazio">Não foi possível carregar o artista.</p>

  return (
    <>
      <header className="cabecalho-artista">
        <p className="rotulo">Artista</p>
        <h1>{artista.nome_artistico}</h1>
        {artista.descricao && <p className="descricao-artista">{artista.descricao}</p>}
        <p className="totais">
          <span className="estatistica-destaque">{numero(artista.total_reproducoes)}</span> reproduções totais
        </p>
      </header>

      <h2>Álbuns</h2>
      <GradeAlbuns albuns={artista.albuns} />
    </>
  )
}

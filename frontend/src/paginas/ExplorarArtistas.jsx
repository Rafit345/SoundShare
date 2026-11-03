// Explorar Artistas: busca por nome artístico, leva à página do artista (CPA001)

import { useState } from 'react'
import { Link } from 'react-router-dom'
import useDados from '../useDados'
import { plural } from '../formatos'
import Capa from '../componentes/Capa'

export default function ExplorarArtistas() {
  const [busca, setBusca] = useState('')
  const caminho = 'artistas/' + (busca ? `?busca=${encodeURIComponent(busca)}` : '')
  const { dados: artistas, carregando } = useDados(caminho)

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Explorar Artistas</h1>
          <p className="subtitulo">Encontre produtores e ouça a discografia deles.</p>
        </div>
      </div>

      <div className="campo">
        <input
          type="search"
          placeholder="Buscar artista pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar artista"
        />
      </div>

      {carregando && !artistas && <p className="carregando">Carregando...</p>}
      {artistas && artistas.length === 0 && (
        <p className="vazio">Nenhum artista encontrado.</p>
      )}
      {artistas && artistas.length > 0 && (
        <section className="grade-cartoes">
          {artistas.map((artista) => (
            <Link key={artista.id} to={`/artistas/${artista.id}`} className="cartao-item">
              <Capa url={artista.albuns[0]?.capa_url} tamanho="media" titulo={artista.nome_artistico} />
              <h3>{artista.nome_artistico}</h3>
              <p>{plural(artista.albuns.length, 'álbum', 'álbuns')} • {plural(artista.total_reproducoes, 'play', 'plays')}</p>
            </Link>
          ))}
        </section>
      )}
    </>
  )
}

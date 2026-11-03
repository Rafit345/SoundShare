// EPA001 - Editar Perfil de Artista (visão editável, sem id na URL)
// o artista é identificado pelo token salvo no navegador

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errosPorCampo } from '../api'
import useDados from '../useDados'
import { minutosSegundos, numero, plural } from '../formatos'
import Capa from '../componentes/Capa'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'

export default function MinhaPagina() {
  const { dados: pagina, setDados: setPagina, carregando } = useDados('artistas/eu/')
  const { dados: cancoes } = useDados('cancoes/?minhas=1')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erros, setErros] = useState({})
  const [sucesso, setSucesso] = useState('')

  // preenche o formulário quando os dados chegam da API
  useEffect(() => {
    if (pagina) {
      setNome(pagina.nome_artistico)
      setDescricao(pagina.descricao)
    }
  }, [pagina])

  async function salvar(evento) {
    evento.preventDefault()
    setErros({})
    setSucesso('')
    try {
      // PUT com os novos dados, como descrito no EPA001
      const atualizada = await api('artistas/eu/', {
        method: 'PUT',
        dados: { nome_artistico: nome, descricao },
      })
      setPagina(atualizada)
      setSucesso('Perfil atualizado com sucesso')
    } catch (e) {
      setErros(errosPorCampo(e))
    }
  }

  if (carregando || !pagina) return <p className="carregando">Carregando...</p>

  return (
    <form onSubmit={salvar}>
      <div className="cabecalho-pagina">
        <div>
          <h1>Editar Perfil de Artista</h1>
          <p className="subtitulo">
            Personalize como os ouvintes veem sua página.{' '}
            <Link to={`/artistas/${pagina.id}`}>Ver página pública</Link>
          </p>
        </div>
        <button type="submit" className="botao botao-primario">Salvar alterações</button>
      </div>

      <Mensagem tipo="sucesso">{sucesso}</Mensagem>

      <div className="duas-colunas">
        <div className="coluna">
          <section className="cartao">
            <h2>Informações básicas</h2>
            <div className={'campo' + (erros.nome_artistico ? ' com-erro' : '')}>
              <label htmlFor="id_nome">Nome artístico</label>
              <input
                type="text"
                id="id_nome"
                maxLength={100}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              {erros.nome_artistico && <span className="erro-campo">{erros.nome_artistico}</span>}
            </div>
            <div className={'campo' + (erros.descricao ? ' com-erro' : '')}>
              <label htmlFor="id_descricao">
                Descrição (até 1000 caracteres)
                <span className="contador">{descricao.length} / 1000</span>
              </label>
              <textarea
                id="id_descricao"
                maxLength={1000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              {erros.descricao && <span className="erro-campo">{erros.descricao}</span>}
            </div>
          </section>

          <section className="cartao">
            <div className="titulo-cartao">
              <h2>Gerenciar conteúdo</h2>
              <div className="grupo-botoes">
                <Link to="/albuns/novo" className="botao"><Icone nome="mais" /> Novo álbum</Link>
                <Link to="/musicas/nova" className="botao"><Icone nome="mais" /> Nova música</Link>
              </div>
            </div>

            <h3>Álbuns</h3>
            {pagina.albuns.length === 0 && <p className="vazio">Nenhum álbum publicado</p>}
            <ul className="lista-conteudo">
              {pagina.albuns.map((album) => (
                <li key={album.id}>
                  <Link to={`/albuns/${album.id}`} className="item-conteudo">
                    <Capa url={album.capa_url} tamanho="mini" titulo={album.nome} />
                    <div>
                      <strong>{album.nome}</strong>
                      <span>Álbum • {plural(album.quantidade_cancoes, 'música', 'músicas')}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop: 24 }}>Músicas</h3>
            {cancoes && cancoes.length === 0 && <p className="vazio">Nenhuma música cadastrada</p>}
            <ul className="lista-conteudo">
              {cancoes && cancoes.map((cancao) => (
                <li key={cancao.id}>
                  <Link to={`/musicas/${cancao.id}/editar`} className="item-conteudo">
                    <div className="capa capa-mini capa-vazia"><Icone nome="nota" /></div>
                    <div>
                      <strong>{cancao.nome}</strong>
                      <span>
                        {cancao.genero_musical} • {minutosSegundos(cancao.duracao_segundos)} •{' '}
                        {plural(cancao.total_reproducoes, 'play', 'plays')}{!cancao.visivel && ' • oculta'}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="cartao estatisticas">
          <h2>Estatísticas</h2>
          <dl>
            <div>
              <dt>Plays totais</dt>
              <dd className="estatistica-destaque">{numero(pagina.total_reproducoes)}</dd>
            </div>
            <div>
              <dt>Músicas publicadas</dt>
              <dd>{cancoes ? cancoes.length : '—'}</dd>
            </div>
            <div>
              <dt>Álbuns</dt>
              <dd>{pagina.albuns.length}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </form>
  )
}

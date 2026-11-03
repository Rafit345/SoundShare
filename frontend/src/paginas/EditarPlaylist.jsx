// GPL001 - Gerenciar Playlist (criar, editar e excluir)
// a busca adiciona canções de todo o acervo (relação n×n Playlist × Canção)

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, errosPorCampo, mensagemDeErro } from '../api'
import { useAuth } from '../Autenticacao'
import useDados from '../useDados'
import EditorFaixas, { ItemDisponivel } from '../componentes/EditorFaixas'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'

export default function EditarPlaylist() {
  const { id } = useParams()
  const editando = Boolean(id)
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { dados: playlist, carregando, erro } = useDados(editando ? `playlists/${id}/` : null)
  const [nome, setNome] = useState('')
  const [privada, setPrivada] = useState(true)
  const [capaUrl, setCapaUrl] = useState('')
  const [faixas, setFaixas] = useState([])
  const [busca, setBusca] = useState('')
  const [erros, setErros] = useState({})
  const { dados: resultados } = useDados(busca.trim() ? `cancoes/?busca=${encodeURIComponent(busca)}` : null)

  useEffect(() => {
    if (playlist) {
      setNome(playlist.nome)
      setPrivada(playlist.privada)
      setCapaUrl(playlist.capa_url)
      setFaixas(playlist.cancoes)
    }
  }, [playlist])

  if (editando && carregando) return <p className="carregando">Carregando...</p>
  if (editando && erro) return <Mensagem>{mensagemDeErro(erro)}</Mensagem>
  if (editando && playlist && playlist.usuario !== usuario.id) {
    return <Mensagem>Somente o criador pode editar esta playlist.</Mensagem>
  }

  const disponiveis = (busca.trim() && resultados ? resultados : [])
    .filter((c) => !faixas.some((f) => f.id === c.id))

  async function salvar(evento) {
    evento.preventDefault()
    setErros({})
    if (!nome.trim()) {
      setErros({ nome: 'Informe um nome para a playlist' })
      return
    }
    const dados = { nome, privada, capa_url: capaUrl, cancoes_ids: faixas.map((f) => f.id) }
    try {
      const salva = editando
        ? await api(`playlists/${id}/`, { method: 'PUT', dados })
        : await api('playlists/', { method: 'POST', dados })
      navigate(`/playlists/${salva.id}`)
    } catch (e) {
      setErros(errosPorCampo(e))
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir a playlist "${playlist.nome}"?`)) {
      return
    }
    try {
      await api(`playlists/${id}/`, { method: 'DELETE' })
      navigate('/playlists')
    } catch (e) {
      setErros({ geral: mensagemDeErro(e) })
    }
  }

  return (
    <form onSubmit={salvar}>
      <div className="cabecalho-pagina">
        <div>
          <p className="rotulo">{editando ? 'Editando playlist' : 'Nova playlist'}</p>
          <h1>{nome || 'Sem nome'}</h1>
        </div>
        <div className="grupo-botoes">
          {editando && (
            <button type="button" className="botao botao-perigo" onClick={excluir}>
              <Icone nome="lixo" /> Excluir
            </button>
          )}
          <button type="submit" className="botao botao-primario">Salvar</button>
        </div>
      </div>

      <Mensagem>{erros.geral || erros.cancoes_ids}</Mensagem>

      <section className="cartao" style={{ marginBottom: 24 }}>
        <div className="linha-campos">
          <div className={'campo' + (erros.nome ? ' com-erro' : '')}>
            <label htmlFor="id_nome">
              Nome <span className="contador">{nome.length}/100 caracteres</span>
            </label>
            <input type="text" id="id_nome" maxLength={100} value={nome}
              onChange={(e) => setNome(e.target.value)} />
            {erros.nome && <span className="erro-campo">{erros.nome}</span>}
          </div>
          <div className={'campo' + (erros.capa_url ? ' com-erro' : '')}>
            <label htmlFor="id_capa">URL da capa (opcional)</label>
            <input type="url" id="id_capa" maxLength={500} placeholder="https://..." value={capaUrl}
              onChange={(e) => setCapaUrl(e.target.value)} />
            {erros.capa_url && <span className="erro-campo">{erros.capa_url}</span>}
          </div>
        </div>
        <label className="campo-checkbox">
          <input type="checkbox" checked={privada} onChange={(e) => setPrivada(e.target.checked)} />
          Playlist particular (só você pode ver)
        </label>
      </section>

      <div className="duas-colunas">
        <EditorFaixas faixas={faixas} setFaixas={setFaixas} />
        <section className="cartao">
          <h2>Adicionar músicas</h2>
          <div className="campo">
            <input type="search" placeholder="Buscar músicas para adicionar à playlist..."
              value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar músicas" />
          </div>
          {busca.trim() && resultados && disponiveis.length === 0 && (
            <p className="dica">Nenhuma música encontrada.</p>
          )}
          <ul className="lista-selecao resultados-busca">
            {disponiveis.map((cancao) => (
              <ItemDisponivel key={cancao.id} cancao={cancao}
                aoAdicionar={(c) => setFaixas([...faixas, c])} />
            ))}
          </ul>
        </section>
      </div>
    </form>
  )
}

// GAL001 - Gerenciar Álbum (criar, editar e excluir)
// só aparecem para seleção as canções do próprio produtor

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, errosPorCampo, mensagemDeErro } from '../api'
import { useAuth } from '../Autenticacao'
import useDados from '../useDados'
import Capa from '../componentes/Capa'
import EditorFaixas, { ItemDisponivel } from '../componentes/EditorFaixas'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'

export default function EditarAlbum() {
  const { id } = useParams()
  const editando = Boolean(id)
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { dados: album, carregando, erro } = useDados(editando ? `albuns/${id}/` : null)
  const { dados: minhasCancoes } = useDados('cancoes/?minhas=1')
  const [nome, setNome] = useState('')
  const [capaUrl, setCapaUrl] = useState('')
  const [faixas, setFaixas] = useState([])
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (album) {
      setNome(album.nome)
      setCapaUrl(album.capa_url)
      setFaixas(album.cancoes)
    }
  }, [album])

  if (editando && carregando) return <p className="carregando">Carregando...</p>
  if (editando && erro) return <p className="vazio">Álbum não encontrado.</p>
  if (editando && album && album.usuario !== usuario.id) {
    return <Mensagem>Somente o produtor criador do álbum pode editá-lo.</Mensagem>
  }

  const disponiveis = (minhasCancoes || []).filter((c) => !faixas.some((f) => f.id === c.id))

  async function salvar(evento) {
    evento.preventDefault()
    setErros({})
    if (!nome.trim()) {
      setErros({ nome: 'Informe um nome para o álbum' })
      return
    }
    const dados = { nome, capa_url: capaUrl, cancoes_ids: faixas.map((f) => f.id) }
    try {
      const salvo = editando
        ? await api(`albuns/${id}/`, { method: 'PUT', dados })
        : await api('albuns/', { method: 'POST', dados })
      navigate(`/albuns/${salvo.id}`)
    } catch (e) {
      setErros(errosPorCampo(e))
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir o álbum "${album.nome}"? As canções continuam cadastradas.`)) {
      return
    }
    try {
      await api(`albuns/${id}/`, { method: 'DELETE' })
      navigate('/minha-pagina')
    } catch (e) {
      setErros({ geral: mensagemDeErro(e) })
    }
  }

  return (
    <form onSubmit={salvar}>
      <header className="cabecalho-colecao">
        <Capa url={capaUrl} titulo={nome} />
        <div style={{ flex: 1 }}>
          <p className="rotulo">{editando ? 'Gerenciando álbum' : 'Novo álbum'}</p>
          <div className={'campo' + (erros.nome ? ' com-erro' : '')}>
            <label htmlFor="id_nome">Nome</label>
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
          <div className="grupo-botoes">
            <button type="submit" className="botao botao-primario">Salvar álbum</button>
            {editando && (
              <button type="button" className="botao botao-perigo" onClick={excluir}>
                <Icone nome="lixo" /> Excluir
              </button>
            )}
          </div>
        </div>
      </header>

      <Mensagem>{erros.geral || erros.cancoes_ids}</Mensagem>

      <div className="duas-colunas">
        <EditorFaixas faixas={faixas} setFaixas={setFaixas} />
        <section className="cartao">
          <h2>Adicionar suas músicas</h2>
          {minhasCancoes && minhasCancoes.length === 0 && (
            <p className="dica">Você ainda não cadastrou músicas. Use "Nova Música" no menu.</p>
          )}
          <ul className="lista-selecao">
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

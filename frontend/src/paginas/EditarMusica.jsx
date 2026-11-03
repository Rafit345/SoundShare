// EDC001 - Editar Canção (nome, gênero, arquivo, visibilidade) e excluir

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, errosPorCampo, mensagemDeErro } from '../api'
import { useAuth } from '../Autenticacao'
import useDados from '../useDados'
import { minutosSegundos, numero } from '../formatos'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'
import SeletorArquivo, { extensaoValida } from '../componentes/SeletorArquivo'
import { GENEROS } from './NovaMusica'

export default function EditarMusica() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { dados: cancao, setDados: setCancao, erro, carregando } = useDados(`cancoes/${id}/`)
  const [nome, setNome] = useState('')
  const [genero, setGenero] = useState('')
  const [visivel, setVisivel] = useState(true)
  const [novoArquivo, setNovoArquivo] = useState(null)
  const [trocando, setTrocando] = useState(false)
  const [erros, setErros] = useState({})
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    if (cancao) {
      setNome(cancao.nome)
      setGenero(cancao.genero_musical)
      setVisivel(cancao.visivel)
    }
  }, [cancao])

  if (carregando) return <p className="carregando">Carregando...</p>
  if (erro) return <p className="vazio">Canção não encontrada.</p>
  // canção de outro artista: acesso negado (EDC001, fluxo alternativo)
  if (cancao.usuario !== usuario.id) {
    return <Mensagem>Você não tem permissão para editar esta canção.</Mensagem>
  }

  function escolherArquivo(escolhido) {
    if (!extensaoValida(escolhido)) {
      setErros({ arquivo_midia: 'Formato de arquivo não suportado' })
      return
    }
    setErros({})
    setNovoArquivo(escolhido)
  }

  async function salvar(evento) {
    evento.preventDefault()
    setErros({})
    setSucesso('')
    let dados
    if (novoArquivo) {
      // com arquivo novo vai como multipart, senão JSON
      dados = new FormData()
      dados.append('nome', nome)
      dados.append('genero_musical', genero)
      dados.append('visivel', visivel)
      dados.append('arquivo_midia', novoArquivo)
    } else {
      dados = { nome, genero_musical: genero, visivel }
    }
    try {
      const atualizada = await api(`cancoes/${id}/`, { method: 'PATCH', dados })
      setCancao(atualizada)
      setNovoArquivo(null)
      setTrocando(false)
      setSucesso('Canção atualizada com sucesso')
    } catch (e) {
      setErros(errosPorCampo(e))
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir "${cancao.nome}"? Ela também sai dos álbuns e playlists.`)) {
      return
    }
    try {
      await api(`cancoes/${id}/`, { method: 'DELETE' })
      navigate('/minha-pagina')
    } catch (e) {
      setErros({ geral: mensagemDeErro(e) })
    }
  }

  const nomeArquivo = decodeURIComponent(cancao.arquivo_midia.split('/').pop())

  return (
    <form onSubmit={salvar}>
      <div className="cabecalho-pagina">
        <div>
          <h1>Editar Música</h1>
          <p className="subtitulo">Atualize as informações da sua faixa.</p>
        </div>
        <div className="grupo-botoes">
          <button type="button" className="botao botao-perigo" onClick={excluir}>
            <Icone nome="lixo" /> Excluir música
          </button>
          <button type="submit" className="botao botao-primario">Salvar alterações</button>
        </div>
      </div>

      <Mensagem tipo="sucesso">{sucesso}</Mensagem>
      <Mensagem>{erros.geral}</Mensagem>

      <div className="duas-colunas">
        <section className="cartao">
          <div className={'campo' + (erros.nome ? ' com-erro' : '')}>
            <label htmlFor="id_nome">Título da música</label>
            <input type="text" id="id_nome" maxLength={200} value={nome}
              onChange={(e) => setNome(e.target.value)} />
            {erros.nome && <span className="erro-campo">{erros.nome}</span>}
          </div>
          <div className={'campo' + (erros.genero_musical ? ' com-erro' : '')}>
            <label htmlFor="id_genero">Gênero</label>
            <input type="text" id="id_genero" list="generos" maxLength={100} value={genero}
              onChange={(e) => setGenero(e.target.value)} />
            <datalist id="generos">
              {GENEROS.map((g) => <option key={g} value={g} />)}
            </datalist>
            {erros.genero_musical && <span className="erro-campo">{erros.genero_musical}</span>}
          </div>

          <label className="subtitulo">Arquivo de áudio atual</label>
          <div className="arquivo-escolhido">
            <Icone nome="volume" />
            <div>
              <strong>{novoArquivo ? novoArquivo.name : nomeArquivo}</strong>
              <div className="subtitulo">
                {novoArquivo ? 'novo arquivo, será enviado ao salvar' : minutosSegundos(cancao.duracao_segundos)}
              </div>
            </div>
            <button type="button" className="botao" onClick={() => setTrocando(!trocando)}>
              Substituir arquivo
            </button>
          </div>
          {!novoArquivo && <audio controls src={cancao.arquivo_midia} style={{ width: '100%' }} />}
          {trocando && <SeletorArquivo aoEscolher={escolherArquivo} erro={erros.arquivo_midia} />}
        </section>

        <div className="coluna">
          <section className="cartao">
            <h2>Estatísticas da faixa</h2>
            {/* o total de reproduções aparece mas não é editável */}
            <p className="numero-grande">{numero(cancao.total_reproducoes)}</p>
            <p className="legenda">Plays totais</p>
          </section>
          <section className="cartao">
            <h2>Visibilidade</h2>
            <label className="campo-checkbox">
              <input type="checkbox" checked={visivel} onChange={(e) => setVisivel(e.target.checked)} />
              Pública
            </label>
            <p className="dica">
              Quando pública, qualquer pessoa no SoundShare pode encontrar e ouvir esta música.
              Oculta, ela some das buscas sem precisar ser excluída.
            </p>
          </section>
          <Link to="/minha-pagina">← Voltar para minha página</Link>
        </div>
      </div>
    </form>
  )
}

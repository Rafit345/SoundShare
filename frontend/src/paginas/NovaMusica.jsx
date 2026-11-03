// CAC001 - Cadastrar Canção (upload do .wav/.mp3, nome e gênero)

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errosPorCampo } from '../api'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'
import SeletorArquivo, { extensaoValida } from '../componentes/SeletorArquivo'

// gênero é classificação livre; estes são só sugestões no campo
export const GENEROS = ['Rock', 'Pop', 'MPB', 'Eletrônica', 'Techno', 'Deep House',
  'Synthwave', 'Hip Hop', 'Funk', 'Samba', 'Jazz', 'Clássica', 'Indie']

export default function NovaMusica() {
  const [arquivo, setArquivo] = useState(null)
  const [nome, setNome] = useState('')
  const [genero, setGenero] = useState('')
  const [erros, setErros] = useState({})
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  function escolherArquivo(escolhido) {
    setSucesso('')
    if (!extensaoValida(escolhido)) {
      setArquivo(null)
      setErros({ arquivo_midia: 'Formato de arquivo não suportado' })
      return
    }
    setErros({})
    setArquivo(escolhido)
  }

  async function enviar(evento) {
    evento.preventDefault()
    setSucesso('')
    if (!nome.trim() || !genero.trim() || !arquivo) {
      setErros({ geral: 'Preencha todos os campos obrigatórios' })
      return
    }
    // upload multipart: o arquivo vai junto com os outros campos
    const formulario = new FormData()
    formulario.append('nome', nome)
    formulario.append('genero_musical', genero)
    formulario.append('arquivo_midia', arquivo)
    setEnviando(true)
    try {
      const cancao = await api('cancoes/', { method: 'POST', dados: formulario })
      // permanece na tela para permitir um novo cadastro
      setSucesso(`"${cancao.nome}" foi publicada!`)
      setNome('')
      setGenero('')
      setArquivo(null)
      setErros({})
    } catch (e) {
      setErros(errosPorCampo(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} style={{ maxWidth: 760 }}>
      <div className="cabecalho-pagina">
        <div>
          <h1>Upload de Nova Música</h1>
          <p className="subtitulo">Compartilhe sua última criação com o mundo.</p>
        </div>
      </div>

      <Mensagem tipo="sucesso">
        {sucesso && <>{sucesso} <Link to="/minha-pagina">Voltar para minha página</Link></>}
      </Mensagem>
      <Mensagem>{erros.geral}</Mensagem>

      <SeletorArquivo aoEscolher={escolherArquivo} erro={erros.arquivo_midia} />

      {arquivo && (
        <div className="arquivo-escolhido">
          <Icone nome="nota" />
          <strong>{arquivo.name}</strong>
          <span className="subtitulo">{(arquivo.size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      )}

      <section className="cartao">
        <h2>Detalhes da música</h2>
        <div className="linha-campos">
          <div className={'campo' + (erros.nome ? ' com-erro' : '')}>
            <label htmlFor="id_nome">Título da música</label>
            <input
              type="text"
              id="id_nome"
              maxLength={200}
              placeholder="Ex: Summer Breeze"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {erros.nome && <span className="erro-campo">{erros.nome}</span>}
          </div>
          <div className={'campo' + (erros.genero_musical ? ' com-erro' : '')}>
            <label htmlFor="id_genero">Gênero</label>
            <input
              type="text"
              id="id_genero"
              list="generos"
              maxLength={100}
              placeholder="Ex: Rock, Pop, MPB"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            />
            <datalist id="generos">
              {GENEROS.map((g) => <option key={g} value={g} />)}
            </datalist>
            {erros.genero_musical && <span className="erro-campo">{erros.genero_musical}</span>}
          </div>
        </div>
        <div className="grupo-botoes">
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Publicar música'}
          </button>
          <Link to="/minha-pagina" className="botao">Cancelar</Link>
        </div>
      </section>
    </form>
  )
}

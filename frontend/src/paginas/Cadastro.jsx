// CAD001 - Realizar Cadastro

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, paginaInicial } from '../Autenticacao'
import { api, errosPorCampo } from '../api'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'

// mensagem de erro embaixo de cada campo
function Erro({ erros, campo }) {
  return erros[campo] ? <span className="erro-campo">{erros[campo]}</span> : null
}

export default function Cadastro() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({
    username: '',
    password1: '',
    password2: '',
    tipo_usuario: 'ouvinte',
    nome_artistico: '',
  })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  if (usuario) {
    return <Navigate to={paginaInicial(usuario)} replace />
  }

  function mudar(campo, valor) {
    setDados({ ...dados, [campo]: valor })
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErros({})
    // confere a confirmação antes de enviar, o back-end valida de novo
    if (dados.password1 !== dados.password2) {
      setErros({ password2: 'As senhas não coincidem' })
      return
    }
    setEnviando(true)
    try {
      await api('auth/cadastro/', { method: 'POST', dados })
      navigate('/login', { state: { cadastrado: true } })
    } catch (e) {
      setErros(errosPorCampo(e))
      // os outros campos continuam preenchidos, só as senhas são limpas
      setDados({ ...dados, password1: '', password2: '' })
      setEnviando(false)
    }
  }

  return (
    <div className="tela-acesso">
      <div className="marca">
        <h1 style={{ color: 'var(--verde)' }}>SoundShare</h1>
        <p className="subtitulo">Crie sua conta e comece a compartilhar.</p>
      </div>

      <form className="cartao cartao-acesso" onSubmit={aoEnviar}>
        <h2>Cadastre-se</h2>
        <Mensagem>{erros.__all__}</Mensagem>

        <div className={'campo' + (erros.username ? ' com-erro' : '')}>
          <label htmlFor="id_username">Nome de usuário</label>
          <input
            type="text"
            id="id_username"
            maxLength={50}
            placeholder="usuario123"
            value={dados.username}
            onChange={(e) => mudar('username', e.target.value)}
            required
          />
          <Erro erros={erros} campo="username" />
        </div>

        <div className={'campo' + (erros.password1 ? ' com-erro' : '')}>
          <label htmlFor="id_password1">Senha</label>
          <input
            type="password"
            id="id_password1"
            minLength={8}
            value={dados.password1}
            onChange={(e) => mudar('password1', e.target.value)}
            required
          />
          <p className="dica">No mínimo 8 caracteres, não pode ser só números.</p>
          <Erro erros={erros} campo="password1" />
        </div>

        <div className={'campo' + (erros.password2 ? ' com-erro' : '')}>
          <label htmlFor="id_password2">Confirmar senha</label>
          <input
            type="password"
            id="id_password2"
            value={dados.password2}
            onChange={(e) => mudar('password2', e.target.value)}
            required
          />
          <Erro erros={erros} campo="password2" />
        </div>

        <div className="campo">
          <label>Tipo de conta</label>
          <div className="tipos-conta">
            <button
              type="button"
              className={'tipo-conta' + (dados.tipo_usuario === 'ouvinte' ? ' selecionado' : '')}
              onClick={() => mudar('tipo_usuario', 'ouvinte')}
            >
              <Icone nome="nota" />
              Ouvinte
            </button>
            <button
              type="button"
              className={'tipo-conta' + (dados.tipo_usuario === 'produtor' ? ' selecionado' : '')}
              onClick={() => mudar('tipo_usuario', 'produtor')}
            >
              <Icone nome="disco" />
              Produtor
            </button>
          </div>
        </div>

        {/* nome artístico só para produtor */}
        {dados.tipo_usuario === 'produtor' && (
          <div className={'campo' + (erros.nome_artistico ? ' com-erro' : '')}>
            <label htmlFor="id_nome_artistico">Nome artístico</label>
            <input
              type="text"
              id="id_nome_artistico"
              maxLength={100}
              value={dados.nome_artistico}
              onChange={(e) => mudar('nome_artistico', e.target.value)}
              required
            />
            <Erro erros={erros} campo="nome_artistico" />
          </div>
        )}

        <div className="grupo-botoes">
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            Cadastrar
          </button>
        </div>

        <div className="rodape-acesso">
          Já tem uma conta?
          <Link to="/login">Cancelar e voltar ao login</Link>
        </div>
      </form>
    </div>
  )
}

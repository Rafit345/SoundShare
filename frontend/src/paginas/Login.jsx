// LOG001 - Efetuar Login

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, paginaInicial } from '../Autenticacao'
import { mensagemDeErro } from '../api'
import Icone from '../componentes/Icone'
import Mensagem from '../componentes/Mensagem'

export default function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // quem já está logado vai direto para a tela inicial
  if (usuario) {
    return <Navigate to={paginaInicial(usuario)} replace />
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const logado = await entrar(username, password)
      navigate(paginaInicial(logado))
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="tela-acesso">
      <div className="marca">
        <div className="logo-icone"><Icone nome="nota" tamanho={32} /></div>
        <h1>SoundShare</h1>
        <p className="subtitulo">Sua música, sua comunidade.</p>
      </div>

      <form className="cartao cartao-acesso" onSubmit={aoEnviar}>
        <h2>Acessar sua conta</h2>

        {/* mensagem de sucesso que vem do cadastro (CAD001) */}
        {location.state?.cadastrado && (
          <Mensagem tipo="sucesso">Cadastro realizado! Faça o login.</Mensagem>
        )}
        <Mensagem>{erro}</Mensagem>

        <div className="campo">
          <label htmlFor="id_username">Nome de usuário</label>
          <input
            type="text"
            id="id_username"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="id_password">Senha</label>
          <input
            type="password"
            id="id_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          Entrar
        </button>

        <div className="rodape-acesso">
          Não tem uma conta?
          <Link to="/cadastro">Cadastre-se</Link>
        </div>
      </form>

      <p className="copyright">© 2026 SoundShare - PMR3304</p>
    </div>
  )
}

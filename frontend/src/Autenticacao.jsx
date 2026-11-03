// Guarda quem está logado e oferece login/logout para todas as telas

import { createContext, useContext, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api, lerUsuario, salvarSessao, limparSessao } from './api'

const ContextoAuth = createContext(null)

export function ProvedorAuth({ children }) {
  const [usuario, setUsuario] = useState(lerUsuario())

  async function entrar(username, password) {
    const dados = await api('auth/login/', {
      method: 'POST',
      dados: { username, password },
    })
    const { token, ...resto } = dados
    salvarSessao(token, resto)
    setUsuario(resto)
    return resto
  }

  async function sair() {
    try {
      await api('auth/logout/', { method: 'POST' })
    } finally {
      limparSessao()
      setUsuario(null)
    }
  }

  const ehProdutor = usuario?.tipo_usuario === 'produtor'

  return (
    <ContextoAuth.Provider value={{ usuario, ehProdutor, entrar, sair }}>
      {children}
    </ContextoAuth.Provider>
  )
}

export function useAuth() {
  return useContext(ContextoAuth)
}

// o sistema só é acessível depois do login (proposta); algumas telas são só do produtor
export function RotaProtegida({ children, soProdutor = false }) {
  const { usuario, ehProdutor } = useAuth()
  if (!usuario) {
    return <Navigate to="/login" replace />
  }
  if (soProdutor && !ehProdutor) {
    return <Navigate to="/" replace />
  }
  return children
}

// tela inicial conforme o tipo de usuário (LOG001, fluxo alternativo)
export function paginaInicial(usuario) {
  return usuario?.tipo_usuario === 'produtor' ? '/minha-pagina' : '/playlists'
}

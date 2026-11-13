// Comunicação com a API do Django (/api/v1/)
// o token de sessão fica no Local Storage depois do login (LOG001)

// no desenvolvimento a API é o runserver; no Render o endereço vem da
// variável VITE_API_URL, lida pelo Vite na hora do build
const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/'

export function lerToken() {
  return localStorage.getItem('token')
}

export function lerUsuario() {
  const dados = localStorage.getItem('usuario')
  return dados ? JSON.parse(dados) : null
}

export function salvarSessao(token, usuario) {
  localStorage.setItem('token', token)
  localStorage.setItem('usuario', JSON.stringify(usuario))
}

export function limparSessao() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

// faz a requisição e devolve o JSON; em caso de erro lança {status, dados}
// "dados" pode ser um objeto (vira JSON) ou um FormData (upload de arquivo)
export async function api(caminho, { method = 'GET', dados } = {}) {
  const headers = {}
  const token = lerToken()
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }

  let body
  if (dados instanceof FormData) {
    body = dados
  } else if (dados !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(dados)
  }

  const resposta = await fetch(BASE + caminho, { method, headers, body })

  // token inválido ou expirado: volta para o login (EPA001, fluxo alternativo)
  if (resposta.status === 401) {
    limparSessao()
    window.location.href = '/login'
    throw { status: 401, dados: null }
  }
  if (resposta.status === 204) {
    return null
  }

  const json = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    throw { status: resposta.status, dados: json }
  }
  return json
}

// transforma o erro da API em uma frase para mostrar na tela
export function mensagemDeErro(erro) {
  const dados = erro?.dados
  if (!dados) {
    return 'Não foi possível falar com o servidor'
  }
  if (dados.erro) return dados.erro
  if (dados.detail) return dados.detail
  const mensagens = Object.values(dados).flat()
  return mensagens.join(' ')
}

// erros por campo, no formato {campo: 'mensagem'}
export function errosPorCampo(erro) {
  const dados = erro?.dados || {}
  const erros = {}
  for (const campo in dados) {
    erros[campo] = [dados[campo]].flat().join(' ')
  }
  return erros
}

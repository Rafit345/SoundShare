// Reprodução das canções (REP001): fila, faixa atual e controles
// usa o elemento <audio> do HTML5 com o arquivo enviado pelo produtor

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api } from './api'

const ContextoPlayer = createContext(null)

export function ProvedorPlayer({ children }) {
  const audio = useRef(null)
  if (!audio.current) {
    audio.current = new Audio()
  }
  const [fila, setFila] = useState([])
  const [indice, setIndice] = useState(0)
  const [tocando, setTocando] = useState(false)
  const [tempo, setTempo] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [volume, setVolume] = useState(0.8)

  const atual = fila[indice] || null

  function carregar(lista, i) {
    const cancao = lista[i]
    if (!cancao) return
    audio.current.src = cancao.arquivo_midia
    audio.current.play().catch(() => {})
    // cada início de reprodução soma +1 na canção (POST porque muda o estado)
    api(`cancoes/${cancao.id}/reproduzir/`, { method: 'POST' }).catch(() => {})
  }

  // "Reproduzir tudo" ou play em uma linha da tabela: toca em sequência a partir dela
  function tocarLista(lista, inicio = 0) {
    setFila(lista)
    setIndice(inicio)
    carregar(lista, inicio)
  }

  function pularPara(i) {
    setIndice(i)
    carregar(fila, i)
  }

  function proxima() {
    if (indice + 1 < fila.length) {
      pularPara(indice + 1)
    } else {
      setTocando(false)
    }
  }

  function anterior() {
    // como nos players comuns: se já passou de 3s, volta para o começo da faixa
    if (audio.current.currentTime > 3 || indice === 0) {
      audio.current.currentTime = 0
    } else {
      pularPara(indice - 1)
    }
  }

  function alternar() {
    if (!atual) return
    if (audio.current.paused) {
      audio.current.play().catch(() => {})
    } else {
      audio.current.pause()
    }
  }

  function buscar(segundos) {
    audio.current.currentTime = segundos
  }

  function mudarVolume(valor) {
    audio.current.volume = valor
    setVolume(valor)
  }

  function parar() {
    audio.current.pause()
    audio.current.removeAttribute('src')
    setFila([])
    setIndice(0)
  }

  // o evento "ended" precisa sempre da versão mais nova de proxima()
  const proximaRef = useRef(proxima)
  proximaRef.current = proxima

  useEffect(() => {
    const elemento = audio.current
    elemento.volume = volume
    const aoTocar = () => setTocando(true)
    const aoPausar = () => setTocando(false)
    const aoAtualizar = () => setTempo(elemento.currentTime)
    const aoCarregar = () => setDuracao(elemento.duration || 0)
    const aoTerminar = () => proximaRef.current()
    elemento.addEventListener('play', aoTocar)
    elemento.addEventListener('pause', aoPausar)
    elemento.addEventListener('timeupdate', aoAtualizar)
    elemento.addEventListener('loadedmetadata', aoCarregar)
    elemento.addEventListener('ended', aoTerminar)
    return () => {
      elemento.removeEventListener('play', aoTocar)
      elemento.removeEventListener('pause', aoPausar)
      elemento.removeEventListener('timeupdate', aoAtualizar)
      elemento.removeEventListener('loadedmetadata', aoCarregar)
      elemento.removeEventListener('ended', aoTerminar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const valor = {
    fila, indice, atual, tocando, tempo, duracao, volume,
    tocarLista, pularPara, proxima, anterior, alternar, buscar, mudarVolume, parar,
  }
  return <ContextoPlayer.Provider value={valor}>{children}</ContextoPlayer.Provider>
}

export function usePlayer() {
  return useContext(ContextoPlayer)
}

// Busca dados da API quando a tela abre (e de novo quando o caminho muda)

import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export default function useDados(caminho) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const recarregar = useCallback(async () => {
    if (!caminho) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      setDados(await api(caminho))
    } catch (e) {
      setErro(e)
    } finally {
      setCarregando(false)
    }
  }, [caminho])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { dados, setDados, erro, carregando, recarregar }
}

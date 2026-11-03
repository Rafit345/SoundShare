// Área de upload do arquivo de áudio (arrastar e soltar ou selecionar)
// aceita só .wav e .mp3; o back-end valida de novo (CAC001)

import { useRef, useState } from 'react'
import Icone from './Icone'

const EXTENSOES = ['wav', 'mp3']

export function extensaoValida(arquivo) {
  const extensao = arquivo.name.split('.').pop().toLowerCase()
  return EXTENSOES.includes(extensao)
}

export default function SeletorArquivo({ aoEscolher, erro }) {
  const entrada = useRef(null)
  const [arrastando, setArrastando] = useState(false)

  function escolher(arquivos) {
    if (arquivos && arquivos[0]) {
      aoEscolher(arquivos[0])
    }
  }

  return (
    <div
      className={'area-upload' + (arrastando ? ' arrastando' : '')}
      onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files) }}
    >
      <div className="icone-upload"><Icone nome="upload" tamanho={32} /></div>
      <h3>Arraste e solte seu arquivo de áudio</h3>
      <p className="subtitulo">Suporta arquivos .WAV ou .MP3</p>
      <p>
        <button type="button" className="botao" onClick={() => entrada.current.click()}>
          Selecionar arquivo
        </button>
      </p>
      <input
        ref={entrada}
        type="file"
        accept=".wav,.mp3,audio/wav,audio/mpeg"
        onChange={(e) => { escolher(e.target.files); e.target.value = '' }}
      />
      {erro && <span className="erro-campo">{erro}</span>}
    </div>
  )
}

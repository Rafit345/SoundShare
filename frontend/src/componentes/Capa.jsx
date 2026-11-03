// Capa de álbum/playlist: usa a URL da capa ou um gradiente com uma nota musical

import Icone from './Icone'

export default function Capa({ url, tamanho = 'grande', titulo = '' }) {
  if (url) {
    return <img className={`capa capa-${tamanho}`} src={url} alt={`Capa de ${titulo}`} />
  }
  return (
    <div className={`capa capa-${tamanho} capa-vazia`} aria-label={`Capa de ${titulo}`}>
      <Icone nome="nota" tamanho={tamanho === 'grande' ? 64 : 22} />
    </div>
  )
}

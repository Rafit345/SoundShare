// Lista editável das faixas de um álbum ou playlist (GAL001 / GPL001):
// a ordem da lista é a ordem de reprodução; os totais são recalculados na hora

import { duracaoTotal, minutosSegundos, plural } from '../formatos'
import Icone from './Icone'

export default function EditorFaixas({ faixas, setFaixas }) {
  function mover(i, direcao) {
    const nova = [...faixas]
    const destino = i + direcao
    if (destino < 0 || destino >= nova.length) return
    ;[nova[i], nova[destino]] = [nova[destino], nova[i]]
    setFaixas(nova)
  }

  function remover(cancao) {
    setFaixas(faixas.filter((f) => f.id !== cancao.id))
  }

  const total = faixas.reduce((soma, f) => soma + f.duracao_segundos, 0)

  return (
    <section className="cartao">
      <div className="titulo-cartao">
        <h2>Lista de faixas</h2>
        <span className="subtitulo">{plural(faixas.length, 'canção', 'canções')} • {duracaoTotal(total)}</span>
      </div>
      {faixas.length === 0 && <p className="vazio">Nenhuma canção adicionada ainda.</p>}
      <ul className="lista-selecao">
        {faixas.map((cancao, i) => (
          <li key={cancao.id}>
            <span>{i + 1}</span>
            <div>
              <strong>{cancao.nome}</strong>
              <span>
                {cancao.artista} • {minutosSegundos(cancao.duracao_segundos)} •{' '}
                {plural(cancao.total_reproducoes, 'play', 'plays')}
              </span>
            </div>
            <button type="button" className="botao-icone" title="Subir" onClick={() => mover(i, -1)}>↑</button>
            <button type="button" className="botao-icone" title="Descer" onClick={() => mover(i, 1)}>↓</button>
            <button type="button" className="botao-icone" title="Remover" onClick={() => remover(cancao)}>
              <Icone nome="fechar" tamanho={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// item da lista de canções disponíveis, com botão de adicionar
export function ItemDisponivel({ cancao, aoAdicionar }) {
  return (
    <li>
      <div className="capa capa-mini capa-vazia"><Icone nome="nota" /></div>
      <div>
        <strong>{cancao.nome}</strong>
        <span>{cancao.artista} • {minutosSegundos(cancao.duracao_segundos)}</span>
      </div>
      <button type="button" className="botao-icone" title="Adicionar" onClick={() => aoAdicionar(cancao)}>
        <Icone nome="mais" />
      </button>
    </li>
  )
}

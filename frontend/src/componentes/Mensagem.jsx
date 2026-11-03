// Caixa de aviso (erro ou sucesso) usada nos formulários

import Icone from './Icone'

export default function Mensagem({ tipo = 'erro', children }) {
  if (!children) return null
  return (
    <div className={`mensagem mensagem-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <Icone nome="alerta" />
      <span>{children}</span>
    </div>
  )
}

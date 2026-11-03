// funções de exibição usadas em várias telas

// 225 -> "3:45"
export function minutosSegundos(segundos) {
  const min = Math.floor(segundos / 60)
  const seg = String(Math.floor(segundos % 60)).padStart(2, '0')
  return `${min}:${seg}`
}

// 655 -> "10 min 55 seg" (duração total do cabeçalho, REP001)
export function duracaoTotal(segundos) {
  const min = Math.floor(segundos / 60)
  const seg = segundos % 60
  return min > 0 ? `${min} min ${seg} seg` : `${seg} seg`
}

// 12450 -> "12.450"
export function numero(valor) {
  return Number(valor || 0).toLocaleString('pt-BR')
}

// (1, 'canção', 'canções') -> "1 canção"; (3, ...) -> "3 canções"
export function plural(quantidade, singular, varios) {
  return `${numero(quantidade)} ${quantidade === 1 ? singular : varios}`
}

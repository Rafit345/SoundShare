// Ícones em SVG (traço simples, herdam a cor do texto)

const caminhos = {
  inicio: 'M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.3-4.3',
  lista: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0',
  sair: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11',
  disco: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  upload: 'M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  pagina: 'M4 5h16v14H4zM8 10h3M8 14h8M14 9h2v3h-2z',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  proxima: 'M6 4.5v15l10-7.5z',
  anterior: 'M18 4.5v15L8 12z',
  volume: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6',
  mais: 'M12 5v14M5 12h14',
  fechar: 'M6 6l12 12M18 6 6 18',
  nota: 'M9 18a3 3 0 1 1-2-2.83V6l12-2v11a3 3 0 1 1-2-2.83V7.4L9 8.8z',
  lixo: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  editar: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  alerta: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v5m0 3h.01',
  voltar: 'M15 18l-6-6 6-6',
}

export default function Icone({ nome, tamanho = 18 }) {
  const preenchido = ['play', 'pause', 'proxima', 'anterior'].includes(nome)
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={preenchido ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={caminhos[nome]} />
      {(nome === 'proxima' || nome === 'anterior') && (
        <path d={nome === 'proxima' ? 'M18 4v16' : 'M6 4v16'} stroke="currentColor" strokeWidth="2.5" />
      )}
    </svg>
  )
}

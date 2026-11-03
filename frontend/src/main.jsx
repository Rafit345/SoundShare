import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProvedorAuth } from './Autenticacao'
import { ProvedorPlayer } from './Player'
import App from './App'
import './estilo.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorAuth>
        <ProvedorPlayer>
          <App />
        </ProvedorPlayer>
      </ProvedorAuth>
    </BrowserRouter>
  </StrictMode>,
)

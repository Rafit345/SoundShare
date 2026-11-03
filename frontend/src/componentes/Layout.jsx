// Estrutura das telas logadas: menu lateral, conteúdo e barra do player

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, paginaInicial } from '../Autenticacao'
import { usePlayer } from '../Player'
import BarraPlayer from './BarraPlayer'
import Icone from './Icone'

function ItemMenu({ para, icone, children }) {
  return (
    <NavLink to={para} end className={({ isActive }) => 'item-menu' + (isActive ? ' ativo' : '')}>
      <Icone nome={icone} />
      <span>{children}</span>
    </NavLink>
  )
}

export default function Layout() {
  const { usuario, ehProdutor, sair } = useAuth()
  const player = usePlayer()
  const navigate = useNavigate()

  async function aoSair() {
    player.parar()
    await sair()
    navigate('/login')
  }

  return (
    <div className={'app' + (player.atual ? ' com-player' : '')}>
      <aside className="menu-lateral">
        <NavLink to={paginaInicial(usuario)} className="logo">
          <span className="logo-icone"><Icone nome="nota" /></span>
          SoundShare
        </NavLink>

        <nav>
          <ul>
            <li><ItemMenu para={paginaInicial(usuario)} icone="inicio">Início</ItemMenu></li>
            <li><ItemMenu para="/artistas" icone="busca">Explorar Artistas</ItemMenu></li>
            <li><ItemMenu para="/playlists" icone="lista">Minhas Playlists</ItemMenu></li>
          </ul>

          {/* o painel só aparece para quem é produtor */}
          {ehProdutor && (
            <>
              <p className="titulo-menu">Painel do Produtor</p>
              <ul>
                <li><ItemMenu para="/minha-pagina" icone="pagina">Minha Página</ItemMenu></li>
                <li><ItemMenu para="/albuns/novo" icone="disco">Novo Álbum</ItemMenu></li>
                <li><ItemMenu para="/musicas/nova" icone="upload">Nova Música</ItemMenu></li>
              </ul>
            </>
          )}

          <p className="titulo-menu">Minha Conta</p>
          <ul>
            <li className="item-menu usuario-logado">
              <Icone nome="usuario" />
              <span>{usuario.username}</span>
            </li>
            <li>
              <button className="item-menu sair" onClick={aoSair}>
                <Icone nome="sair" />
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>

      <BarraPlayer />
    </div>
  )
}

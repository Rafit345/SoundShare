// Rotas do front-end: cada tela corresponde a um caso de uso

import { Navigate, Route, Routes } from 'react-router-dom'
import { RotaProtegida, useAuth, paginaInicial } from './Autenticacao'
import Layout from './componentes/Layout'
import Login from './paginas/Login'
import Cadastro from './paginas/Cadastro'
import MinhasPlaylists from './paginas/MinhasPlaylists'
import Playlist from './paginas/Playlist'
import EditarPlaylist from './paginas/EditarPlaylist'
import ExplorarArtistas from './paginas/ExplorarArtistas'
import Artista from './paginas/Artista'
import MinhaPagina from './paginas/MinhaPagina'
import Album from './paginas/Album'
import EditarAlbum from './paginas/EditarAlbum'
import NovaMusica from './paginas/NovaMusica'
import EditarMusica from './paginas/EditarMusica'
import Tocando from './paginas/Tocando'

function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={usuario ? paginaInicial(usuario) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* login é a primeira página do sistema (LOG001) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<Inicio />} />

      <Route element={<RotaProtegida><Layout /></RotaProtegida>}>
        <Route path="/playlists" element={<MinhasPlaylists />} />
        <Route path="/playlists/nova" element={<EditarPlaylist />} />
        <Route path="/playlists/:id" element={<Playlist />} />
        <Route path="/playlists/:id/editar" element={<EditarPlaylist />} />
        <Route path="/artistas" element={<ExplorarArtistas />} />
        <Route path="/artistas/:id" element={<Artista />} />
        <Route path="/albuns/:id" element={<Album />} />
        <Route path="/tocando" element={<Tocando />} />

        {/* telas exclusivas do produtor */}
        <Route path="/minha-pagina" element={<RotaProtegida soProdutor><MinhaPagina /></RotaProtegida>} />
        <Route path="/albuns/novo" element={<RotaProtegida soProdutor><EditarAlbum /></RotaProtegida>} />
        <Route path="/albuns/:id/editar" element={<RotaProtegida soProdutor><EditarAlbum /></RotaProtegida>} />
        <Route path="/musicas/nova" element={<RotaProtegida soProdutor><NovaMusica /></RotaProtegida>} />
        <Route path="/musicas/:id/editar" element={<RotaProtegida soProdutor><EditarMusica /></RotaProtegida>} />
      </Route>

      <Route path="*" element={<Inicio />} />
    </Routes>
  )
}

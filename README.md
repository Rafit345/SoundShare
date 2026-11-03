# SoundShare

Website de compartilhamento de canções e discografia — projeto da disciplina PMR3304
(Sistemas de Informação, Poli-USP, 2026).

- **Back-end:** Django + Django REST Framework (API em `/api/v1/`)
- **Front-end:** React (Vite), em `frontend/`, consumindo a API
- **Banco:** SQLite no desenvolvimento, PostgreSQL no Render

## Rodando localmente

Back-end (no ambiente virtual do curso):

```bash
./.virtualenvs/djangodev/Scripts/Activate.ps1   # a partir da pasta do usuário (~)
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Front-end (em outro terminal):

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173/. No desenvolvimento o Vite repassa `/api` e `/media`
para o Django em http://127.0.0.1:8000/.

## Telas e casos de uso

| Tela | Caso de uso |
|---|---|
| `/login` | LOG001 - Efetuar Login |
| `/cadastro` | CAD001 - Realizar Cadastro |
| `/artistas`, `/artistas/:id` | CPA001 - Consultar Página de Artista |
| `/minha-pagina` | EPA001 - Editar Perfil de Artista |
| `/playlists`, `/playlists/nova`, `/playlists/:id/editar` | GPL001 - Gerenciar Playlist |
| `/albuns/novo`, `/albuns/:id/editar` | GAL001 - Gerenciar Álbum |
| `/musicas/nova` | CAC001 - Cadastrar Canção |
| `/musicas/:id/editar` | EDC001 - Editar Canção |
| `/playlists/:id`, `/albuns/:id`, `/tocando` | REP001 - Reproduzir Playlist ou Álbum |

## Endpoints da API

| Endpoint | Métodos |
|---|---|
| `auth/cadastro/`, `auth/login/`, `auth/logout/` | POST |
| `auth/eu/` | GET |
| `artistas/`, `artistas/<id>/` | GET |
| `artistas/eu/` | GET, PUT |
| `cancoes/`, `albuns/`, `playlists/` | GET, POST |
| `cancoes/<id>/`, `albuns/<id>/`, `playlists/<id>/` | GET, PUT, PATCH, DELETE |
| `cancoes/<id>/reproduzir/` | POST |

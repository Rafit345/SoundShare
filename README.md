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
echo "from api.exemplos import carregar; carregar()" | python manage.py shell   # opcional: dados de exemplo
python manage.py runserver
```

Front-end (em outro terminal):

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173/. Como na aula 6, o React (porta 5173) chama a API direto em
http://127.0.0.1:8000/ e o Django libera essa origem com o `django-cors-headers`.

Contas de exemplo (criadas pelo `api/exemplos.py`, senha `soundshare2026`): produtores
`beatflux` e `solarecho`, ouvinte `ana`.

## Deploy no Render

São dois serviços, como no laboratório: a API (Web Service) e o React (Static Site),
que conversam por CORS.

1. **Banco:** New + → PostgreSQL (plano Free). Copiar a *Internal Database URL*.
   O banco gratuito expira depois de algumas semanas: criar perto da entrega.
2. **API:** New + → Web Service → repositório do GitHub.
   - Build Command: `./build.sh` — Start Command: `gunicorn soundshare.wsgi`
   - Environment: `PYTHON_VERSION` = `3.12.10`, `DATABASE_URL` (do passo 1), `SECRET_KEY`
     (qualquer texto longo), `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`,
     `DJANGO_SUPERUSER_PASSWORD` e, depois do passo 3, `FRONTEND_URL` com o endereço do site
     (ex.: `https://soundshare-web.onrender.com`, sem barra no fim).
3. **Front-end:** New + → Static Site → mesmo repositório.
   - Root Directory: `frontend` — Build Command: `npm install && npm run build` —
     Publish Directory: `dist`
   - Environment: `VITE_API_URL` = endereço da API + `/api/v1/`
     (ex.: `https://soundshare-api.onrender.com/api/v1/`)
   - Redirects/Rewrites: Source `/*`, Destination `/index.html`, Action **Rewrite**
     (senão recarregar uma página como `/playlists/1` dá 404).
4. Voltar na API, preencher o `FRONTEND_URL` e fazer *Manual Deploy*.

Cuidados: no plano gratuito a API "dorme" sem acesso e demora ~1 min no primeiro pedido
(abrir antes de apresentar). O disco também é apagado a cada deploy ou reinício: músicas
enviadas pelo site somem, mas as de exemplo são recriadas pelo `build.sh`.

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

from django.contrib.auth import authenticate
from django.contrib.auth.models import Group, Permission
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from musica.models import PaginaArtista, Cancao, Album, Playlist
from .forms import CadastroForm
from .permissions import EhDonoOuSomenteLeitura, PermissaoPlaylist
from .serializers import (CancaoSerializer, AlbumSerializer,
                          PlaylistSerializer, PaginaArtistaSerializer,
                          tipo_do_usuario)

# permissões de cada tipo de usuário (<app>.<operacao>_<modelo>, aula 5)
PERMISSOES_OUVINTE = [
    'view_paginaartista', 'view_cancao', 'view_album',
    'add_playlist', 'change_playlist', 'delete_playlist', 'view_playlist',
]
# o produtor pode tudo que o ouvinte pode, mais publicar conteúdo
PERMISSOES_PRODUTOR = PERMISSOES_OUVINTE + [
    'change_paginaartista',
    'add_cancao', 'change_cancao', 'delete_cancao',
    'add_album', 'change_album', 'delete_album',
]


def obter_grupo(nome, codenames):
    # se o grupo ainda não existir, cria com as permissões (como no slide 43)
    try:
        grupo = Group.objects.get(name=nome)
    except Group.DoesNotExist:
        grupo = Group(name=nome)
        grupo.save()
        grupo.permissions.set([
            Permission.objects.get(codename=c, content_type__app_label='musica')
            for c in codenames
        ])
    return grupo


def dados_do_usuario(usuario):
    # o que o front-end precisa saber de quem está logado
    pagina = PaginaArtista.objects.filter(usuario=usuario).first()
    return {
        'id': usuario.id,
        'username': usuario.username,
        'tipo_usuario': tipo_do_usuario(usuario),
        'pagina_artista_id': pagina.id if pagina else None,
    }


# Autenticação (LOG001 e CAD001)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def cadastro(request):
    form = CadastroForm(request.data)
    if form.is_valid():
        user = form.save()
        if form.cleaned_data['tipo_usuario'] == 'produtor':
            user.groups.add(obter_grupo('produtor', PERMISSOES_PRODUTOR))
            # cadastro como produtor já cria a página de artista
            pagina = PaginaArtista(
                usuario=user,
                nome_artistico=form.cleaned_data['nome_artistico'])
            pagina.save()
        else:
            user.groups.add(obter_grupo('ouvinte', PERMISSOES_OUVINTE))
        return Response(dados_do_usuario(user), status=status.HTTP_201_CREATED)
    erros = {campo: list(mensagens) for campo, mensagens in form.errors.items()}
    return Response(erros, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    user = authenticate(username=request.data.get('username'),
                        password=request.data.get('password'))
    if user is None:
        return Response({'erro': 'Usuário ou senha inválidos'},
                        status=status.HTTP_400_BAD_REQUEST)
    # o token é guardado pelo front-end no Local Storage
    token, criado = Token.objects.get_or_create(user=user)
    dados = dados_do_usuario(user)
    dados['token'] = token.key
    return Response(dados)


@api_view(['POST'])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def usuario_logado(request):
    return Response(dados_do_usuario(request.user))


# Páginas de artista (CPA001 e EPA001)

class ArtistaList(generics.ListAPIView):
    serializer_class = PaginaArtistaSerializer

    def get_queryset(self):
        queryset = PaginaArtista.objects.all()
        if self.request.GET.get('busca', False):
            queryset = queryset.filter(
                nome_artistico__icontains=self.request.GET['busca'])
        return queryset


class ArtistaDetail(generics.RetrieveAPIView):
    queryset = PaginaArtista.objects.all()
    serializer_class = PaginaArtistaSerializer


class MinhaPagina(generics.RetrieveUpdateAPIView):
    # a URL não tem o id do artista: ele vem do token de quem está logado
    serializer_class = PaginaArtistaSerializer

    def get_object(self):
        return get_object_or_404(PaginaArtista, usuario=self.request.user)


# Canções (CAC001 e EDC001)

class CancaoList(generics.ListCreateAPIView):
    # POST exige a permissão add_cancao, ou seja, só produtor
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions]
    queryset = Cancao.objects.all()
    serializer_class = CancaoSerializer

    def get_queryset(self):
        if self.request.GET.get('minhas', False):
            # produtor vendo as próprias canções, inclusive as ocultas
            queryset = Cancao.objects.filter(usuario=self.request.user)
        else:
            queryset = Cancao.objects.filter(visivel=True)
        if self.request.GET.get('busca', False):
            queryset = queryset.filter(
                nome__icontains=self.request.GET['busca'])
        return queryset

    def perform_create(self, serializer):
        # o dono da canção é quem está logado, não um campo do formulário
        cancao = serializer.save(usuario=self.request.user)
        cancao.atualizar_duracao()


class CancaoDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          EhDonoOuSomenteLeitura]
    queryset = Cancao.objects.all()
    serializer_class = CancaoSerializer

    def perform_update(self, serializer):
        cancao = serializer.save()
        # se veio arquivo novo, a duração precisa ser lida de novo
        if 'arquivo_midia' in serializer.validated_data:
            cancao.atualizar_duracao()


@api_view(['POST'])
def reproduzir_cancao(request, pk):
    # POST porque muda o estado no back-end (contagem de reproduções)
    cancao = get_object_or_404(Cancao, pk=pk)
    cancao.incrementar_reproducao()
    return Response({'id': cancao.id,
                     'total_reproducoes': cancao.total_reproducoes})


# Álbuns (GAL001)

class AlbumList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions]
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

    def get_queryset(self):
        if self.request.GET.get('minhas', False):
            return Album.objects.filter(usuario=self.request.user)
        return Album.objects.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AlbumDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          EhDonoOuSomenteLeitura]
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer


# Playlists (GPL001 e REP001)

class PlaylistList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions]
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        # "Minhas Playlists": só as do usuário logado
        return Playlist.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class PlaylistDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          PermissaoPlaylist]
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

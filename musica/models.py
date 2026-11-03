from django.db import models
from django.db.models import Sum
from django.conf import settings
from django.core.validators import FileExtensionValidator
import mutagen


def ler_duracao_arquivo(arquivo):
    # lê a duração (em segundos) de um .wav ou .mp3 com o mutagen;
    # devolve None se o arquivo não for um áudio válido
    try:
        audio = mutagen.File(arquivo)
    except mutagen.MutagenError:
        return None
    if audio is None or audio.info is None:
        return None
    return round(audio.info.length)


class PaginaArtista(models.Model):
    # só existe para Produtores; é criada junto com o usuário no cadastro (CAD001)
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL,
                                   on_delete=models.CASCADE)
    nome_artistico = models.CharField(max_length=100)
    descricao = models.CharField(max_length=1000, blank=True)

    def calcular_total_reproducoes(self):
        # soma das reproduções de todas as canções do artista (CPA001)
        total = Cancao.objects.filter(usuario=self.usuario).aggregate(
            total=Sum('total_reproducoes'))['total']
        return total or 0

    def __str__(self):
        return f'{self.nome_artistico} ({self.usuario.username})'


class Cancao(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE)
    nome = models.CharField(max_length=200)
    genero_musical = models.CharField(max_length=100)
    arquivo_midia = models.FileField(
        upload_to='cancoes/',
        max_length=500,
        validators=[FileExtensionValidator(
            allowed_extensions=['wav', 'mp3'],
            message='Formato de arquivo não suportado')])
    duracao_segundos = models.IntegerField(default=0)
    total_reproducoes = models.IntegerField(default=0)
    visivel = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def atualizar_duracao(self):
        # chamado depois do upload (CAC001) ou da troca do arquivo (EDC001)
        self.duracao_segundos = ler_duracao_arquivo(self.arquivo_midia) or 0
        self.save()

    def incrementar_reproducao(self):
        self.total_reproducoes = self.total_reproducoes + 1
        self.save()

    def album_de_origem(self):
        # primeiro álbum em que a canção aparece, quando existir (REP001)
        album = self.album_set.first()
        return album.nome if album else None

    def __str__(self):
        return f'{self.nome} - {self.usuario.username}'


class Album(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    capa_url = models.URLField(max_length=500, blank=True)
    cancoes = models.ManyToManyField(Cancao, through='AlbumCancao')
    data_criacao = models.DateTimeField(auto_now_add=True)

    def listar_cancoes(self):
        # canções na ordem de reprodução definida em AlbumCancao
        return self.cancoes.order_by('albumcancao__ordem')

    # totalizações calculadas na hora, não ficam salvas no banco (REP001)
    def calcular_quantidade_cancoes(self):
        return self.cancoes.count()

    def calcular_duracao_total(self):
        total = self.cancoes.aggregate(total=Sum('duracao_segundos'))['total']
        return total or 0

    def calcular_total_reproducoes(self):
        total = self.cancoes.aggregate(total=Sum('total_reproducoes'))['total']
        return total or 0

    def __str__(self):
        return f'{self.nome} by {self.usuario.username}'


class AlbumCancao(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    cancao = models.ForeignKey(Cancao, on_delete=models.CASCADE)
    ordem = models.IntegerField(default=0)

    class Meta:
        ordering = ['ordem']
        unique_together = ['album', 'cancao']

    def __str__(self):
        return f'{self.album.nome} #{self.ordem}: {self.cancao.nome}'


class Playlist(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    privada = models.BooleanField(default=True)
    capa_url = models.URLField(max_length=500, blank=True)
    cancoes = models.ManyToManyField(Cancao, through='PlaylistCancao')
    data_criacao = models.DateTimeField(auto_now_add=True)

    def pode_ser_editada_por(self, usuario):
        # só o criador edita ou exclui (GPL001)
        return self.usuario == usuario

    def listar_cancoes(self):
        return self.cancoes.order_by('playlistcancao__ordem')

    def calcular_quantidade_cancoes(self):
        return self.cancoes.count()

    def calcular_duracao_total(self):
        total = self.cancoes.aggregate(total=Sum('duracao_segundos'))['total']
        return total or 0

    def calcular_total_reproducoes(self):
        total = self.cancoes.aggregate(total=Sum('total_reproducoes'))['total']
        return total or 0

    def __str__(self):
        return f'{self.nome} by {self.usuario.username}'


class PlaylistCancao(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    cancao = models.ForeignKey(Cancao, on_delete=models.CASCADE)
    ordem = models.IntegerField(default=0)
    data_adicao = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['ordem']
        unique_together = ['playlist', 'cancao']

    def __str__(self):
        return f'{self.playlist.nome} #{self.ordem}: {self.cancao.nome}'

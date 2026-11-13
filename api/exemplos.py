# Dados de exemplo para a demonstração: produtores, ouvinte, canções, álbuns e
# uma playlist. Roda no build.sh do Render, como a criação do superusuário:
#   echo "from api.exemplos import carregar; carregar()" | python manage.py shell
# O disco do Render é apagado a cada deploy, então os áudios são gerados de novo
# (sintetizados aqui mesmo, sem arquivos de música no repositório).

import math
import os
import random
import struct
import wave

from django.conf import settings
from django.contrib.auth.models import User

from musica.models import (PaginaArtista, Cancao, Album, AlbumCancao,
                           Playlist, PlaylistCancao)
from .views import obter_grupo, PERMISSOES_OUVINTE, PERMISSOES_PRODUTOR

SENHA = 'soundshare2026'
TAXA = 16000  # amostras por segundo

MAIOR = [0, 2, 4, 5, 7, 9, 11]
MENOR = [0, 2, 3, 5, 7, 8, 10]

PRODUTORES = [
    {
        'username': 'beatflux',
        'nome_artistico': 'Beatmaster Flux',
        'descricao': 'Produtor de música eletrônica de São Paulo, entre o Synthwave e o Techno.',
        'album': 'Cyber Pulse',
        'cancoes': [
            # nome, gênero, tônica (MIDI), escala, bpm, acordes (graus), bateria, plays iniciais
            ('Neon Dreams', 'Synthwave', 57, MENOR, 112, [0, 5, 2, 6], True, 1240),
            ('Cyber City', 'Techno', 52, MENOR, 128, [0, 0, 5, 4], True, 860),
            ('Digital Dawn', 'Synthwave', 60, MAIOR, 104, [0, 4, 5, 3], False, 530),
        ],
    },
    {
        'username': 'solarecho',
        'nome_artistico': 'Solar Echo',
        'descricao': 'Deep House e Lo-fi para o fim de tarde.',
        'album': 'Horizonte',
        'cancoes': [
            ('Midnight Pulse', 'Deep House', 55, MENOR, 122, [0, 3, 5, 4], True, 2100),
            ('Golden Hour', 'Lo-fi', 62, MAIOR, 84, [0, 5, 3, 4], False, 1530),
            ('Ocean Drive', 'Deep House', 59, MAIOR, 118, [5, 3, 0, 4], True, 970),
        ],
    },
]

OUVINTE = 'ana'
PLAYLIST = ('Vibes Noturnas', ['Neon Dreams', 'Midnight Pulse', 'Golden Hour'])


def frequencia(nota):
    # nota MIDI -> Hz (69 = Lá 440 Hz)
    return 440 * 2 ** ((nota - 69) / 12)


def nota_da_escala(tonica, escala, grau):
    oitava, posicao = divmod(grau, len(escala))
    return tonica + escala[posicao] + 12 * oitava


def gerar_wav(caminho, tonica, escala, bpm, acordes, bateria, semente):
    # 8 compassos de 4 tempos: acordes, baixo, melodia e (opcional) bateria
    sorteio = random.Random(semente)
    tempo = 60 / bpm
    compassos = acordes * 2
    total = int(len(compassos) * 4 * tempo * TAXA)
    amostras = [0.0] * total

    def tocar(nota, inicio, duracao, volume, brilho):
        f = frequencia(nota)
        n0, n = int(inicio * TAXA), int(duracao * TAXA)
        for i in range(min(n, total - n0)):
            t = i / TAXA
            envelope = min(1.0, t / 0.01) * math.exp(-3 * t / duracao)
            onda = math.sin(2 * math.pi * f * t) + brilho * math.sin(4 * math.pi * f * t)
            amostras[n0 + i] += volume * envelope * onda

    for c, grau in enumerate(compassos):
        inicio = c * 4 * tempo
        # acorde (tríade) segurando o compasso todo
        for salto in (0, 2, 4):
            tocar(nota_da_escala(tonica, escala, grau + salto), inicio, 4 * tempo, 0.12, 0.3)
        # baixo uma oitava abaixo, a cada tempo
        for b in range(4):
            tocar(nota_da_escala(tonica - 12, escala, grau), inicio + b * tempo, tempo, 0.25, 0.1)
        # melodia em colcheias, com notas do acorde e algumas pausas
        for m in range(8):
            if sorteio.random() < 0.25:
                continue
            salto = sorteio.choice([0, 2, 4, 7])
            tocar(nota_da_escala(tonica + 12, escala, grau + salto),
                  inicio + m * tempo / 2, tempo / 2, 0.14, 0.5)

    if bateria:
        for b in range(int(total / (tempo * TAXA))):
            n0 = int(b * tempo * TAXA)
            # bumbo: seno descendo de 120 Hz para 50 Hz
            for i in range(min(int(0.15 * TAXA), total - n0)):
                t = i / TAXA
                f = 50 + 70 * math.exp(-t * 30)
                amostras[n0 + i] += 0.5 * math.exp(-t * 20) * math.sin(2 * math.pi * f * t)
            # chimbal no contratempo: ruído curto
            n1 = n0 + int(tempo / 2 * TAXA)
            for i in range(min(int(0.04 * TAXA), total - n1)):
                amostras[n1 + i] += 0.08 * math.exp(-i / TAXA * 80) * (sorteio.random() * 2 - 1)

    pico = max(abs(a) for a in amostras) or 1
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with wave.open(caminho, 'wb') as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b''.join(
            struct.pack('<h', int(a / pico * 0.8 * 32767)) for a in amostras))


def criar_usuario(username, grupo, permissoes):
    usuario = User.objects.filter(username=username).first()
    if not usuario:
        usuario = User.objects.create_user(username=username, password=SENHA)
    usuario.groups.add(obter_grupo(grupo, permissoes))
    return usuario


def carregar():
    cancoes = {}
    for semente, produtor in enumerate(PRODUTORES):
        usuario = criar_usuario(produtor['username'], 'produtor', PERMISSOES_PRODUTOR)
        PaginaArtista.objects.get_or_create(
            usuario=usuario,
            defaults={'nome_artistico': produtor['nome_artistico'],
                      'descricao': produtor['descricao']})

        album, _ = Album.objects.get_or_create(usuario=usuario, nome=produtor['album'])
        for ordem, (nome, genero, tonica, escala, bpm, acordes, bateria, plays) in \
                enumerate(produtor['cancoes'], start=1):
            arquivo = f"cancoes/exemplos/{nome.lower().replace(' ', '-')}.wav"
            # o arquivo é gerado de novo em todo deploy
            gerar_wav(os.path.join(settings.MEDIA_ROOT, arquivo),
                      tonica, escala, bpm, acordes, bateria, semente * 10 + ordem)
            cancao, criada = Cancao.objects.get_or_create(
                usuario=usuario, nome=nome,
                defaults={'genero_musical': genero, 'arquivo_midia': arquivo,
                          'total_reproducoes': plays})
            if not criada:
                cancao.arquivo_midia = arquivo
            cancao.atualizar_duracao()
            AlbumCancao.objects.get_or_create(album=album, cancao=cancao,
                                              defaults={'ordem': ordem})
            cancoes[nome] = cancao

    ouvinte = criar_usuario(OUVINTE, 'ouvinte', PERMISSOES_OUVINTE)
    nome, faixas = PLAYLIST
    playlist, _ = Playlist.objects.get_or_create(
        usuario=ouvinte, nome=nome, defaults={'privada': False})
    for ordem, faixa in enumerate(faixas, start=1):
        PlaylistCancao.objects.get_or_create(playlist=playlist, cancao=cancoes[faixa],
                                             defaults={'ordem': ordem})
    print(f'Exemplos carregados: {len(cancoes)} canções')

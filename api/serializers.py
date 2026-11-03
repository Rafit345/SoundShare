from rest_framework import serializers

from musica.models import (PaginaArtista, Cancao, Album, AlbumCancao, Playlist,
                           PlaylistCancao, ler_duracao_arquivo)


def tipo_do_usuario(usuario):
    # o tipo de usuário é o grupo em que ele foi colocado no cadastro
    if usuario.groups.filter(name='produtor').exists():
        return 'produtor'
    return 'ouvinte'


def ids_sem_repeticao(ids):
    # mantém a ordem e tira canções repetidas
    return list(dict.fromkeys(ids))


class CancaoSerializer(serializers.ModelSerializer):
    artista = serializers.ReadOnlyField(
        source='usuario.paginaartista.nome_artistico')
    album_de_origem = serializers.ReadOnlyField()

    class Meta:
        model = Cancao
        fields = ['id', 'usuario', 'artista', 'nome', 'genero_musical',
                  'arquivo_midia', 'duracao_segundos', 'total_reproducoes',
                  'visivel', 'data_cadastro', 'album_de_origem']
        read_only_fields = ['usuario', 'duracao_segundos',
                            'total_reproducoes', 'data_cadastro']
        extra_kwargs = {
            'nome': {'error_messages': {
                'required': 'Preencha todos os campos obrigatórios',
                'blank': 'Preencha todos os campos obrigatórios'}},
            'genero_musical': {'error_messages': {
                'required': 'Preencha todos os campos obrigatórios',
                'blank': 'Preencha todos os campos obrigatórios'}},
            'arquivo_midia': {'error_messages': {
                'required': 'Preencha todos os campos obrigatórios'}},
            # sem isso, no upload multipart o checkbox ausente vira False
            'visivel': {'default': True},
        }

    def validate_arquivo_midia(self, arquivo):
        # além da extensão (validador do modelo), confere se é áudio de verdade
        if ler_duracao_arquivo(arquivo) is None:
            raise serializers.ValidationError(
                'Formato de arquivo não suportado')
        arquivo.seek(0)
        return arquivo


class AlbumSerializer(serializers.ModelSerializer):
    artista = serializers.ReadOnlyField(
        source='usuario.paginaartista.nome_artistico')
    cancoes = CancaoSerializer(many=True, read_only=True,
                               source='listar_cancoes')
    # na escrita o front-end manda só os ids, já na ordem das faixas
    cancoes_ids = serializers.ListField(child=serializers.IntegerField(),
                                        write_only=True,
                                        required=False)
    quantidade_cancoes = serializers.ReadOnlyField(
        source='calcular_quantidade_cancoes')
    duracao_total = serializers.ReadOnlyField(source='calcular_duracao_total')
    total_reproducoes = serializers.ReadOnlyField(
        source='calcular_total_reproducoes')

    class Meta:
        model = Album
        fields = ['id', 'usuario', 'artista', 'nome', 'capa_url',
                  'data_criacao', 'cancoes', 'cancoes_ids',
                  'quantidade_cancoes', 'duracao_total', 'total_reproducoes']
        read_only_fields = ['usuario', 'data_criacao']
        extra_kwargs = {
            'nome': {'error_messages': {
                'required': 'Informe um nome para o álbum',
                'blank': 'Informe um nome para o álbum'}},
        }

    def validate_cancoes_ids(self, ids):
        # o álbum só pode ter canções do próprio produtor (GAL001)
        ids = ids_sem_repeticao(ids)
        usuario = self.context['request'].user
        proprias = Cancao.objects.filter(pk__in=ids, usuario=usuario).count()
        if proprias != len(ids):
            raise serializers.ValidationError(
                'O álbum só pode conter canções cadastradas por você')
        return ids

    def salvar_faixas(self, album, ids):
        AlbumCancao.objects.filter(album=album).exclude(
            cancao_id__in=ids).delete()
        for ordem, cancao_id in enumerate(ids, start=1):
            AlbumCancao.objects.update_or_create(album=album,
                                                 cancao_id=cancao_id,
                                                 defaults={'ordem': ordem})

    def create(self, validated_data):
        ids = validated_data.pop('cancoes_ids', [])
        album = Album.objects.create(**validated_data)
        self.salvar_faixas(album, ids)
        return album

    def update(self, instance, validated_data):
        ids = validated_data.pop('cancoes_ids', None)
        instance = super().update(instance, validated_data)
        if ids is not None:
            self.salvar_faixas(instance, ids)
        return instance


class PlaylistSerializer(serializers.ModelSerializer):
    criador = serializers.ReadOnlyField(source='usuario.username')
    cancoes = CancaoSerializer(many=True, read_only=True,
                               source='listar_cancoes')
    cancoes_ids = serializers.ListField(child=serializers.IntegerField(),
                                        write_only=True,
                                        required=False)
    quantidade_cancoes = serializers.ReadOnlyField(
        source='calcular_quantidade_cancoes')
    duracao_total = serializers.ReadOnlyField(source='calcular_duracao_total')
    total_reproducoes = serializers.ReadOnlyField(
        source='calcular_total_reproducoes')

    class Meta:
        model = Playlist
        fields = ['id', 'usuario', 'criador', 'nome', 'privada', 'capa_url',
                  'data_criacao', 'cancoes', 'cancoes_ids',
                  'quantidade_cancoes', 'duracao_total', 'total_reproducoes']
        read_only_fields = ['usuario', 'data_criacao']
        extra_kwargs = {
            'nome': {'error_messages': {
                'required': 'Informe um nome para a playlist',
                'blank': 'Informe um nome para a playlist'}},
        }

    def validate_cancoes_ids(self, ids):
        # qualquer canção visível do acervo (ou as próprias, mesmo ocultas)
        ids = ids_sem_repeticao(ids)
        usuario = self.context['request'].user
        existentes = Cancao.objects.filter(pk__in=ids)
        for cancao in existentes:
            if not cancao.visivel and cancao.usuario != usuario:
                raise serializers.ValidationError(
                    f'A canção {cancao.id} não está disponível')
        if existentes.count() != len(ids):
            raise serializers.ValidationError('Canção não encontrada')
        return ids

    def salvar_faixas(self, playlist, ids):
        PlaylistCancao.objects.filter(playlist=playlist).exclude(
            cancao_id__in=ids).delete()
        for ordem, cancao_id in enumerate(ids, start=1):
            PlaylistCancao.objects.update_or_create(playlist=playlist,
                                                    cancao_id=cancao_id,
                                                    defaults={'ordem': ordem})

    def create(self, validated_data):
        ids = validated_data.pop('cancoes_ids', [])
        playlist = Playlist.objects.create(**validated_data)
        self.salvar_faixas(playlist, ids)
        return playlist

    def update(self, instance, validated_data):
        ids = validated_data.pop('cancoes_ids', None)
        instance = super().update(instance, validated_data)
        if ids is not None:
            self.salvar_faixas(instance, ids)
        return instance


class PaginaArtistaSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='usuario.username')
    albuns = AlbumSerializer(many=True, read_only=True,
                             source='usuario.album_set')
    total_reproducoes = serializers.ReadOnlyField(
        source='calcular_total_reproducoes')

    class Meta:
        model = PaginaArtista
        fields = ['id', 'usuario', 'username', 'nome_artistico', 'descricao',
                  'albuns', 'total_reproducoes']
        read_only_fields = ['usuario']

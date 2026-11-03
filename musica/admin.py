from django.contrib import admin

from .models import (PaginaArtista, Cancao, Album, AlbumCancao, Playlist,
                     PlaylistCancao)

admin.site.register(PaginaArtista)
admin.site.register(Cancao)
admin.site.register(Album)
admin.site.register(AlbumCancao)
admin.site.register(Playlist)
admin.site.register(PlaylistCancao)

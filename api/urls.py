from django.urls import path

from . import views

urlpatterns = [
    path('auth/cadastro/', views.cadastro, name='cadastro'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/eu/', views.usuario_logado, name='usuario-logado'),
    path('artistas/', views.ArtistaList.as_view()),
    path('artistas/eu/', views.MinhaPagina.as_view()),
    path('artistas/<int:pk>/', views.ArtistaDetail.as_view()),
    path('cancoes/', views.CancaoList.as_view()),
    path('cancoes/<int:pk>/', views.CancaoDetail.as_view()),
    path('cancoes/<int:pk>/reproduzir/', views.reproduzir_cancao),
    path('albuns/', views.AlbumList.as_view()),
    path('albuns/<int:pk>/', views.AlbumDetail.as_view()),
    path('playlists/', views.PlaylistList.as_view()),
    path('playlists/<int:pk>/', views.PlaylistDetail.as_view()),
]

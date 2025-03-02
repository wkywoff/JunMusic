from django.urls import path
from . import views

urlpatterns = [
    path('', views.artist_list, name='home'),  # Added for the root URL
    path('artists/', views.artist_list, name='artist_list'),
    path('artists/<int:artist_id>/', views.artist_detail, name='artist_detail'),
    path('albums/<int:album_id>/', views.album_detail, name='album_detail'),
    path('tracks/<int:track_id>/', views.track_detail, name='track_detail'),
]

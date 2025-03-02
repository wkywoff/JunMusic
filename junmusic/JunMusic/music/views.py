from django.shortcuts import render
from .models import Artist, Album, Track

def artist_list(request):
    artists = Artist.objects.all()
    return render(request, 'music/artist_list.html', {'artists': artists})

def artist_detail(request, artist_id):
    artist = Artist.objects.get(id=artist_id)
    albums = artist.album_set.all()
    return render(request, 'music/artist_detail.html', {'artist': artist, 'albums': albums})

def album_detail(request, album_id):
    album = Album.objects.get(id=album_id)
    tracks = album.track_set.all()
    return render(request, 'music/album_detail.html', {'album': album, 'tracks': tracks})

def track_detail(request, track_id):
    track = Track.objects.get(id=track_id)
    return render(request, 'music/track_detail.html', {'track': track})

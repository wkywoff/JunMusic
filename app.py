import os
import re
import json
from flask import Flask, render_template, request, Response, send_file, redirect, url_for
from mutagen import File as MutagenFile  # Для извлечения длительности аудио

app = Flask(__name__)

# ------------------------------
# 1) Мок-данные: Артисты, альбомы и треки
# ------------------------------

# Функция для загрузки JSON-файла
def load_json(filename):
    filepath = os.path.join(os.path.dirname(__file__), 'data', filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

# Загружаем данные из файлов
ARTISTS = load_json('artists.json')
ALBUMS = load_json('albums.json')

# ------------------------------
# 2) Функции для работы с треками
# ------------------------------

def get_audio_duration(file_path: str) -> int:
    """
    Возвращает длительность аудиофайла в секундах, используя mutagen.
    Если не удалось прочитать, вернёт 0.
    """
    if not os.path.exists(file_path):
        return 0
    audio = MutagenFile(file_path)
    if audio and audio.info:
        return int(audio.info.length)
    return 0

def format_duration(seconds: int) -> str:
    """Преобразует количество секунд в строку формата mm:ss."""
    m, s = divmod(seconds, 60)
    return f"{m}:{s:02d}"

def get_track_by_id(track_id: str):
    """Возвращает словарь трека по его ID или None."""
    for album in ALBUMS:
        for t in album["tracks"]:
            if t["id"] == track_id:
                return t
    return None

# ------------------------------
# 3) Инициализация длительностей треков (делаем один раз при старте)
# ------------------------------

for album in ALBUMS:
    for track in album["tracks"]:
        file_path = os.path.join(app.static_folder, "audio", track["file_name"])
        dur_sec = get_audio_duration(file_path)
        track["duration_seconds"] = dur_sec
        track["duration_str"] = format_duration(dur_sec)

# ------------------------------
# 4) Вспомогательные функции
# ------------------------------

def get_artist_by_id(artist_id: str):
    return next((a for a in ARTISTS if a["id"] == artist_id), None)

def get_albums_by_artist(artist_id: str):
    return [a for a in ALBUMS if a["artist_id"] == artist_id]

# ------------------------------
# 5) Маршруты
# ------------------------------

@app.route("/")
def root():
    # Перенаправляем на /home
    return redirect(url_for("home"))

@app.route("/home")
def home():
    return render_template(
        "home.html",
        albums=ALBUMS,
        get_artist_by_id=get_artist_by_id  # <-- передаём функцию в шаблон
    )

@app.route("/search")
def search():
    """
    Поиск по названию трека, альбома или имени артиста (?q=...).
    """
    query = request.args.get("q", "").strip().lower()
    if not query:
        return render_template("search.html", albums=[], tracks=[], artists=[], query=query)

    found_albums = []
    found_tracks = []
    found_artists = []

    # Ищем в альбомах
    for album in ALBUMS:
        if query in album["title"].lower():
            found_albums.append(album)
        # Ищем в треках
        for t in album["tracks"]:
            if query in t["title"].lower():
                found_tracks.append({"track": t, "album": album})

    # Ищем в артистах
    for artist in ARTISTS:
        if query in artist["name"].lower():
            found_artists.append(artist)

    return render_template(
        "search.html",
        albums=found_albums,
        tracks=found_tracks,
        artists=found_artists,
        query=query
    )

@app.route("/library")
def library():
    """
    Страница Your Library (пока пустая).
    """
    return render_template("library.html")

@app.route("/album/<string:album_id>")
def album_page(album_id):
    """
    Страница конкретного альбома с метаданными и треками.
    """
    album = next((a for a in ALBUMS if a["id"] == album_id), None)
    if not album:
        return "Альбом не найден", 404
    artist = get_artist_by_id(album["artist_id"])
    return render_template("album.html", album=album, artist=artist)

@app.route("/artist/<string:artist_id>")
def artist_page(artist_id):
    artist = get_artist_by_id(artist_id)
    if not artist:
        return "Артист не найден", 404

    # Сортировка альбомов по дате релиза (новейшие первыми)
    albums = sorted(get_albums_by_artist(artist_id), key=lambda a: a["release_date"], reverse=True)

    # Остальной код для получения популярных и liked треков
    popular_tracks = []
    for t_id in artist.get("popular_tracks", []):
        track = get_track_by_id(t_id)
        if track:
            parent_album = next((a for a in ALBUMS if track in a["tracks"]), None)
            popular_tracks.append((track, parent_album))
    liked_tracks = []
    for t_id in artist.get("liked_songs", []):
        track = get_track_by_id(t_id)
        if track:
            parent_album = next((a for a in ALBUMS if track in a["tracks"]), None)
            liked_tracks.append((track, parent_album))

    return render_template(
        "artist.html",
        artist=artist,
        albums=albums,
        popular_tracks=popular_tracks,
        liked_tracks=liked_tracks
    )

@app.route("/stream/<string:track_id>")
def stream(track_id):
    """
    Маршрут для потоковой передачи аудио (с поддержкой Range).
    """
    track = get_track_by_id(track_id)
    if not track:
        return "Трек не найден", 404

    file_path = os.path.join(app.static_folder, "audio", track["file_name"])
    if not os.path.exists(file_path):
        return "Файл не найден", 404

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("Range", None)

    if range_header:
        range_match = re.search(r"bytes=(\d+)-(\d*)", range_header)
        if range_match:
            start = int(range_match.group(1))
            end = range_match.group(2)
            if end:
                end = int(end)
            else:
                end = file_size - 1
            length = end - start + 1

            with open(file_path, "rb") as f:
                f.seek(start)
                data = f.read(length)

            response = Response(data, status=206, mimetype="audio/mpeg")
            response.headers.add("Content-Range", f"bytes {start}-{end}/{file_size}")
            response.headers.add("Accept-Ranges", "bytes")
            response.headers.add("Content-Length", str(length))
            return response

    return send_file(file_path, mimetype="audio/mpeg")

@app.template_filter('intcomma')
def intcomma_filter(value):
    return "{:,}".format(value)

# ------------------------------
# Запуск
# ------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)


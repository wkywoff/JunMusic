import os
from flask import Flask, render_template, send_from_directory
from mutagen import File as MutagenFile

app = Flask(__name__)

# Путь к папке с аудиофайлами (замените на актуальный путь, если необходимо)
AUDIO_FOLDER = os.path.join(os.getcwd(), 'telegram_audio')

def get_audio_files():
    """Возвращает список файлов в папке AUDIO_FOLDER с аудио расширениями."""
    audio_files = []
    for file in os.listdir(AUDIO_FOLDER):
        if file.lower().endswith(('.mp3', '.flac', '.wav', '.ogg')):
            audio_files.append(file)
    return audio_files

def extract_metadata(filename):
    """
    Извлекает метаданные из аудиофайла.
    Если метаданных нет или происходит ошибка, используются значения по умолчанию.
    """
    file_path = os.path.join(AUDIO_FOLDER, filename)
    metadata = {'filename': filename, 'title': os.path.splitext(filename)[0],
                'artist': 'Unknown Artist', 'album': 'Unknown Album'}
    try:
        audio = MutagenFile(file_path, easy=True)
        if audio is not None:
            # Используем методы easy-полей для извлечения информации
            metadata['title'] = audio.get('title', [metadata['title']])[0]
            metadata['artist'] = audio.get('artist', [metadata['artist']])[0]
            metadata['album'] = audio.get('album', [metadata['album']])[0]
    except Exception as e:
        print(f"Ошибка при чтении метаданных файла {filename}: {e}")
    return metadata

@app.route('/')
def index():
    """
    Главная страница.
    Сканирует папку с аудиофайлами, извлекает метаданные и группирует треки по артистам и альбомам.
    """
    audio_files = get_audio_files()
    tracks = [extract_metadata(file) for file in audio_files]

    # Группируем треки в виде словаря: {artist: {album: [track, ...]}}
    music_library = {}
    for track in tracks:
        artist = track['artist']
        album = track['album']
        if artist not in music_library:
            music_library[artist] = {}
        if album not in music_library[artist]:
            music_library[artist][album] = []
        music_library[artist][album].append(track)

    return render_template('index.html', music_library=music_library)

@app.route('/audio/<filename>')
def audio(filename):
    """Маршрут для отдачи аудиофайла для воспроизведения."""
    return send_from_directory(AUDIO_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

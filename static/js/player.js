const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.querySelector('.progress-container');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Элементы для обновления информации о треке в плеере
const playerCover = document.getElementById('player-cover');
const playerTrackTitle = document.getElementById('player-track-title');
const playerTrackArtist = document.getElementById('player-track-artist');

// Глобальные переменные для навигации по трекам
let currentAlbumTracks = null;
let currentTrackIndex = null;

// При нажатии на кнопку Play/Pause
playPauseBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = 'Pause';
  } else {
    audio.pause();
    playPauseBtn.textContent = 'Play';
  }
});

// Обновление прогресс-бара
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Перемотка по клику на прогресс-бар
progressContainer.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

// Функция обновления прогресс-бара
function updateProgress() {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.currentTime >= audio.duration) {
    playPauseBtn.textContent = 'Play';
  }
}

// Форматирование времени в mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Функция для воспроизведения трека
// Теперь принимает: trackId, cover, title, artist, artistId
function playTrack(trackId, cover, title, artist, artistId) {
  // Сохраняем информацию о текущем альбоме для переключения
  window.currentAlbumCover = cover;
  window.currentAlbumArtist = artist;
  
  if (window.currentAlbumTracks && Array.isArray(window.currentAlbumTracks)) {
    currentAlbumTracks = window.currentAlbumTracks;
    currentTrackIndex = currentAlbumTracks.findIndex(t => t.id == trackId);
  } else {
    currentAlbumTracks = null;
    currentTrackIndex = null;
  }
  
  // Обновляем плеер: источник, обложку, название, исполнителя (как ссылку)
  audio.src = `/stream/${trackId}`;
  playerCover.src = `/static/img/${cover}`;
  playerCover.style.visibility = 'visible';
  playerTrackTitle.textContent = title;
  
  // Формируем HTML-ссылку для артиста
  playerTrackArtist.innerHTML = `<a href="/artist/${artistId}" class="artist-link">${artist}</a>`;
  
  audio.play();
  playPauseBtn.textContent = 'Pause';
}

// Обработчик кнопки "Next"
document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentAlbumTracks && currentTrackIndex !== null && currentTrackIndex < currentAlbumTracks.length - 1) {
    const nextTrack = currentAlbumTracks[currentTrackIndex + 1];
    currentTrackIndex++;
    playTrack(nextTrack.id, window.currentAlbumCover, nextTrack.title, window.currentAlbumArtist);
  }
});

// Обработчик кнопки "Prev"
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentAlbumTracks && currentTrackIndex !== null && currentTrackIndex > 0) {
    const prevTrack = currentAlbumTracks[currentTrackIndex - 1];
    currentTrackIndex--;
    playTrack(prevTrack.id, window.currentAlbumCover, prevTrack.title, window.currentAlbumArtist);
  }
});

// Делаем функцию доступной глобально для вызовов из шаблонов
window.playTrack = playTrack;

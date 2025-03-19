// Основной аудиоэлемент
const audio = document.getElementById('audioPlayer');

// Десктопные элементы (если они есть)
const desktopCover = document.getElementById('desktop-cover');
const desktopTrackTitle = document.getElementById('desktop-track-title');
const desktopTrackArtist = document.getElementById('desktop-track-artist');
const desktopProgress = document.getElementById('desktop-progress');
const desktopCurrentTime = document.getElementById('desktop-currentTime');
const desktopDuration = document.getElementById('desktop-duration');
const volumeSliderDesktop = document.getElementById('volumeSliderDesktop');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Мобильные элементы: мини-плеер
const miniPlayer = document.getElementById('miniPlayer');
const miniCover = document.getElementById('miniCover');
const miniTrackTitle = document.getElementById('miniTrackTitle');
const miniTrackArtist = document.getElementById('miniTrackArtist');
const miniPausePlayBtn = document.getElementById('miniPausePlayBtn');

// Мобильные элементы: полноэкранный плеер
const fullscreenPlayer = document.getElementById('fullscreenPlayer');
const fullCover = document.getElementById('fullCover');
const fullTrackTitle = document.getElementById('fullTrackTitle');
const fullTrackArtist = document.getElementById('fullTrackArtist');
const fullProgress = document.getElementById('full-progress');
const fullCurrentTime = document.getElementById('full-currentTime');
const fullDuration = document.getElementById('full-duration');
const fullPlayPauseBtn = document.getElementById('full-playPauseBtn');
const fullPrevBtn = document.getElementById('full-prevBtn');
const fullNextBtn = document.getElementById('full-nextBtn');
const closeFullscreenBtn = document.getElementById('closeFullscreen');

// Дополнительный мобильный слайдер громкости (если есть)
const volumeSlider = document.getElementById('volumeSlider');

// Глобальная переменная для текущего индекса трека
let currentTrackIndex = 0;

// Устанавливаем громкость ~30% по умолчанию
audio.volume = 0.3;

// Функция для форматирования времени в формате mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Функция для обновления иконок Play/Pause во всех плеерах
function updatePlayPauseIcons() {
  const icon = audio.paused ? `<i class="fa-solid fa-play"></i>` : `<i class="fa-solid fa-pause"></i>`;
  if (playPauseBtn) playPauseBtn.innerHTML = icon;
  if (miniPausePlayBtn) miniPausePlayBtn.innerHTML = icon;
  if (fullPlayPauseBtn) fullPlayPauseBtn.innerHTML = icon;
}

// Функция для воспроизведения трека по индексу
function playTrackByIndex(index) {
  if (index < 0 || index >= trackList.length) return;
  currentTrackIndex = index;
  const track = trackList[index];
  playTrack(track.id, track.cover, track.title, track.artist, track.artistId);
}

// Функция для воспроизведения трека, обновляет все группы элементов
function playTrack(trackId, cover, title, artist, artistId) {
  // Обновляем аудио источник; наш маршрут /stream/<trackId> работает с строковыми id
  audio.src = `/stream/${trackId}`;
  
  // Обновляем десктопный плеер (если есть)
  if (desktopCover) {
    desktopCover.src = `/static/img/${cover}`;
    desktopCover.style.visibility = 'visible';
  }
  if (desktopTrackTitle) desktopTrackTitle.textContent = title;
  if (desktopTrackArtist) desktopTrackArtist.innerHTML = `<a href="/artist/${artistId}" class="artist-link">${artist}</a>`;
  
  // Обновляем мобильный мини-плеер
  if (miniCover) miniCover.src = `/static/img/${cover}`;
  if (miniTrackTitle) miniTrackTitle.textContent = title;
  if (miniTrackArtist) miniTrackArtist.textContent = artist;
  
  // Обновляем полноэкранный плеер
  if (fullCover) fullCover.src = `/static/img/${cover}`;
  if (fullTrackTitle) fullTrackTitle.textContent = title;
  if (fullTrackArtist) fullTrackArtist.textContent = artist;
  
  // Запускаем воспроизведение
  audio.play();
  updatePlayPauseIcons();
}

// Обновление прогресс-бара и времени
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  
  // Обновляем десктопный прогресс
  if (desktopProgress) desktopProgress.style.width = `${percent}%`;
  if (desktopCurrentTime) desktopCurrentTime.textContent = formatTime(audio.currentTime);
  if (desktopDuration) desktopDuration.textContent = formatTime(audio.duration);
  
  // Обновляем полноэкранный прогресс
  if (fullProgress) fullProgress.style.width = `${percent}%`;
  if (fullCurrentTime) fullCurrentTime.textContent = formatTime(audio.currentTime);
  if (fullDuration) fullDuration.textContent = formatTime(audio.duration);
  
  updatePlayPauseIcons();
});

// Перемотка при клике по каждому прогресс-контейнеру
document.querySelectorAll('.progress-container').forEach((container) => {
  container.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    audio.currentTime = ratio * audio.duration;
  });
});

// Десктоп: кнопка Play/Pause
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
    updatePlayPauseIcons();
  });
}

// Десктоп: кнопки Prev/Next
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    let prevIndex = (currentTrackIndex - 1 + trackList.length) % trackList.length;
    playTrackByIndex(prevIndex);
  });
}
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    let nextIndex = (currentTrackIndex + 1) % trackList.length;
    playTrackByIndex(nextIndex);
  });
}

// Полноэкранный плеер: кнопка Play/Pause
if (fullPlayPauseBtn) {
  fullPlayPauseBtn.addEventListener("click", () => {
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
    updatePlayPauseIcons();
  });
}

// Полноэкранный плеер: кнопки Prev/Next
if (fullPrevBtn) {
  fullPrevBtn.addEventListener("click", () => {
    let prevIndex = (currentTrackIndex - 1 + trackList.length) % trackList.length;
    playTrackByIndex(prevIndex);
  });
}
if (fullNextBtn) {
  fullNextBtn.addEventListener("click", () => {
    let nextIndex = (currentTrackIndex + 1) % trackList.length;
    playTrackByIndex(nextIndex);
  });
}

// Кнопка закрытия полноэкранного плеера
if (closeFullscreenBtn) {
  closeFullscreenBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fullscreenPlayer.classList.remove("active");
  });
}

// Мини-плеер: клик по нему открывает полноэкранный плеер
if (miniPlayer) {
  miniPlayer.addEventListener('click', () => {
    fullscreenPlayer.classList.add("active");
  });
}

// Чтобы клик по кнопке Play/Pause в мини-плеере не открывал полноэкранный плеер
if (miniPausePlayBtn) {
  miniPausePlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
    updatePlayPauseIcons();
  });
}

// Громкость: мобильный слайдер (если имеется)
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
}
// Громкость: десктопный слайдер (если имеется)
if (volumeSliderDesktop) {
  volumeSliderDesktop.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
}

// Инициализируем воспроизведение первого трека по умолчанию
playTrackByIndex(0);

// Делаем функцию playTrack доступной глобально
window.playTrack = playTrack;

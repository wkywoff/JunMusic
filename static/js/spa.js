// Определяем маршруты и соответствующие функции рендеринга
const routes = {
  home: renderHome,
  search: renderSearch,
  library: renderLibrary,
  album: renderAlbum,
  artist: renderArtist
};

// Функция для рендеринга домашней страницы
function renderHome() {
  const content = `
    <div class="page-content">
      <h1>Home</h1>
      <div class="albums-grid">
        <!-- Пример карточки альбома -->
        <div class="album-card">
          <a href="#" data-link="album" data-id="1">
            <img src="/static/img/cover.jpg" alt="Album Cover" class="album-cover">
          </a>
          <div class="album-info">
            <a href="#" data-link="album" data-id="1" class="album-title">Album Title</a>
            <div class="album-artist">
              <a href="#" data-link="artist" data-id="1">Artist Name</a>
            </div>
            <div class="album-type">Album</div>
          </div>
        </div>
        <!-- Добавьте дополнительные карточки -->
      </div>
    </div>
  `;
  setContent(content);
}

// Функция для рендеринга страницы поиска
function renderSearch() {
  const content = `
    <div class="page-content">
      <h1>Search</h1>
      <form id="searchForm">
        <input type="text" id="searchInput" placeholder="Search for albums, tracks, artists...">
        <button type="submit">Search</button>
      </form>
      <div id="searchResults"></div>
    </div>
  `;
  setContent(content);
  // Пример: обработчик поиска (можно доработать)
  document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('searchResults').innerHTML = `<p>Результаты поиска: ${document.getElementById('searchInput').value}</p>`;
  });
}

// Функция для рендеринга страницы библиотеки
function renderLibrary() {
  const content = `
    <div class="page-content">
      <h1>Your Library</h1>
      <p>Your library content goes here.</p>
    </div>
  `;
  setContent(content);
}

// Функция для рендеринга страницы альбома
function renderAlbum() {
  // Получаем id альбома из параметров URL
  const albumId = getParam('id') || '1';
  const content = `
    <div class="album-page-container">
      <div class="album-banner">
        <img src="/static/img/cover.jpg" alt="Album Cover" class="album-cover-large">
        <div class="album-info">
          <p class="album-type">Album</p>
          <h1 class="album-title">Album Title ${albumId}</h1>
          <p class="album-artist"><a href="#" data-link="artist" data-id="1">Artist Name</a></p>
          <p class="album-meta">2025-01-01 • 10 tracks</p>
        </div>
      </div>
      <div class="album-tracklist">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${generateTrackRows()}
          </tbody>
        </table>
      </div>
    </div>
  `;
  setContent(content);
}

// Функция для рендеринга страницы артиста
function renderArtist() {
  const artistId = getParam('id') || '1';
  const content = `
    <div class="page-content">
      <div class="artist-banner">
        <div class="artist-image-container">
          <img src="/static/img/artist1.jpg" alt="Artist Image" class="artist-image">
        </div>
        <div class="artist-info-container">
          <h2>Artist Name ${artistId}</h2>
          <p>10000 monthly listeners</p>
          <p>Artist bio goes here.</p>
        </div>
      </div>
      <div class="artist-discography">
        <h2>Discography</h2>
        <div class="albums-grid">
          <!-- Пример карточки альбома в дискографии -->
          <div class="album-card">
            <a href="#" data-link="album" data-id="1">
              <img src="/static/img/cover.jpg" alt="Album Cover" class="album-cover">
            </a>
            <div class="album-info">
              <a href="#" data-link="album" data-id="1" class="album-title">Album Title</a>
              <div class="album-type">Album</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  setContent(content);
}

// Устанавливаем содержимое основного контейнера и навешиваем обработчики для ссылок
function setContent(html) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = html;
  attachLinkHandlers();
}

// Навешиваем обработчики на все ссылки с атрибутом data-link
function attachLinkHandlers() {
  const links = document.querySelectorAll('[data-link]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const route = this.getAttribute('data-link');
      const id = this.getAttribute('data-id');
      navigateTo(route, id);
    });
  });
}

// Функция навигации с обновлением истории
function navigateTo(route, id) {
  let url = route;
  if (id) {
    url += '?id=' + id;
  }
  history.pushState({route, id}, null, '#' + url);
  router();
}

// Простой роутер, использующий hash для определения маршрута
function router() {
  const hash = location.hash.slice(1); // удаляем #
  const [route, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  window.currentParams = params;
  if (routes[route]) {
    routes[route]();
  } else {
    renderHome();
  }
}

// Получить значение параметра из URL
function getParam(key) {
  return window.currentParams ? window.currentParams.get(key) : null;
}

// Генерация строк треклиста для страницы альбома
function generateTrackRows() {
  let rows = '';
  for (let i = 1; i <= 10; i++) {
    rows += `
      <tr>
        <td>${i}</td>
        <td>Track ${i}</td>
        <td>Artist Name</td>
        <td>3:45</td>
        <td>
          <button class="play-btn" onclick="playTrack('${i}', 'cover.jpg', 'Track ${i}', 'Artist Name', '1')">
            <i class="fa-solid fa-play"></i>
          </button>
        </td>
      </tr>
    `;
  }
  return rows;
}

// Инициализация роутера
window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);

/* 
  Обработка аудиоплеера 
  (Пример базовой логики, которую можно доработать)
*/
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const playerCover = document.getElementById('player-cover');
const playerTrackTitle = document.getElementById('player-track-title');
const playerTrackArtist = document.getElementById('player-track-artist');
const volumeSlider = document.getElementById('volumeSlider');

// Функция для воспроизведения трека
function playTrack(trackId, cover, title, artist, artistId) {
  audio.src = `/stream/${trackId}`; // предполагается, что сервер поддерживает этот маршрут
  playerCover.src = `/static/img/${cover}`;
  playerCover.style.visibility = 'visible';
  playerTrackTitle.textContent = title;
  playerTrackArtist.innerHTML = `<a href="#" data-link="artist" data-id="${artistId}">${artist}</a>`;
  audio.play();
  playPauseBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  attachLinkHandlers(); // чтобы ссылка в плеере работала
}

// Обработчик кнопки Play/Pause
playPauseBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  } else {
    audio.pause();
    playPauseBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
  }
});

// Пример кнопок Prev/Next (логика для переключения треков может быть расширена)
prevBtn.addEventListener('click', () => {
  // Здесь можно реализовать переключение на предыдущий трек
  console.log('Prev track');
});
nextBtn.addEventListener('click', () => {
  // Здесь можно реализовать переключение на следующий трек
  console.log('Next track');
});

// Обновление прогресс-бара
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

// Обработка клика по прогресс-бару для перемотки
document.querySelector('.progress-container').addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newTime = (clickX / rect.width) * audio.duration;
  audio.currentTime = newTime;
});

// Обработка изменения громкости
volumeSlider.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// Форматирование времени в формате mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

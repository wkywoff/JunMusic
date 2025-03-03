const audio = new Audio();
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const seekBar = document.getElementById('seek-bar');
const currentTime = document.getElementById('current-time');
const trackLength = document.getElementById('track-length');
let currentTrackIndex = 0;
let tracks = [];

fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
        tracks = data.artists.flatMap(artist => 
            artist.releases.flatMap(release => release.tracks.map(track => ({
                ...track,
                artist: artist.name,
                art: artist.image
            })));
    });

function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    audio.src = track.file;
    audio.play();
    playPauseBtn.textContent = '⏸';
    document.getElementById('player-title').textContent = track.title;
    document.getElementById('player-artist').textContent = track.artist;
    document.getElementById('player-art').src = track.art;
    trackLength.textContent = track.length;
}

audio.addEventListener('timeupdate', () => {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
    currentTime.textContent = formatTime(audio.currentTime);
    trackLength.textContent = formatTime(audio.duration);
});

seekBar.addEventListener('input', () => audio.currentTime = seekBar.value);

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    }
});

nextBtn.addEventListener('click', () => {
    if (currentTrackIndex < tracks.length - 1) playTrack(currentTrackIndex + 1);
});

prevBtn.addEventListener('click', () => {
    if (currentTrackIndex > 0) playTrack(currentTrackIndex - 1);
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
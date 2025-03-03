// Load approved users
fetch('data/approved-users.json')
    .then(response => response.json())
    .then(data => window.approvedUsers = data.approved);

// Registration
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    localStorage.setItem('pendingUser', JSON.stringify({ username, email, password }));
    document.getElementById('auth-message').textContent = 'Registration pending approval.';
});

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('login-user').value;
    const password = document.getElementById('login-password').value;
    if (window.approvedUsers.includes(input)) {
        localStorage.setItem('loggedIn', input);
        document.getElementById('auth-message').textContent = 'Logged in successfully!';
        loadContent(); // Load site content
    } else {
        document.getElementById('auth-message').textContent = 'Account not approved or incorrect details.';
    }
});

function loadContent() {
    // Load dynamic content only for logged-in users
    if (localStorage.getItem('loggedIn')) {
        // Add logic to load Home, Search, Library, etc.
    }

}
// Load releases when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
      const grid = document.getElementById('releases-grid');
      data.releases.forEach(release => {
        const releaseDiv = document.createElement('div');
        releaseDiv.className = 'release';
        releaseDiv.innerHTML = `
          <img src="${release.coverArt}" alt="${release.title}">
          <h3>${release.title}</h3>
          <p>${release.type} • ${release.releaseYear}</p>
        `;
        grid.appendChild(releaseDiv);
      });
    })
    .catch(error => console.error('Error loading data:', error));
});

let data; // Store data globally for reuse

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/data.json')
    .then(response => response.json())
    .then(jsonData => {
      data = jsonData; // Cache the data
      const searchInput = document.getElementById('search-input');
      if (searchInput) { // Only run on search.html
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          const filteredReleases = data.releases.filter(release =>
            release.artist.toLowerCase().includes(query) ||
            release.title.toLowerCase().includes(query) ||
            release.tracks.some(track => track.title.toLowerCase().includes(query))
          );
          displayReleases(filteredReleases, 'search-results');
        });
      }
    });
});

function displayReleases(releases, containerId) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = ''; // Clear previous results
  releases.forEach(release => {
    const releaseDiv = document.createElement('div');
    releaseDiv.className = 'release';
    releaseDiv.innerHTML = `
      <img src="${release.coverArt}" alt="${release.title}">
      <h3>${release.title}</h3>
      <p>${release.type} • ${release.releaseYear}</p>
    `;
    grid.appendChild(releaseDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
      const libraryGrid = document.getElementById('library-grid');
      if (libraryGrid) { // Only run on library.html
        const likedTrackIds = JSON.parse(localStorage.getItem('likedTracks')) || [];
        const likedTracks = data.tracks.filter(track => likedTrackIds.includes(track.id));
        likedTracks.forEach(track => {
          const trackDiv = document.createElement('div');
          trackDiv.className = 'track';
          trackDiv.innerHTML = `
            <img src="${track.coverArt}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist} • ${track.duration}</p>
          `;
          libraryGrid.appendChild(trackDiv);
        });
      }
    });
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
      const artistNameElement = document.getElementById('artist-name');
      if (artistNameElement) { // Only run on artist.html
        const urlParams = new URLSearchParams(window.location.search);
        const artistName = urlParams.get('artist');
        artistNameElement.textContent = artistName;

        const artistReleases = data.releases.filter(release => release.artist === artistName);

        // Display all releases by default
        displayReleases(artistReleases, 'artist-releases');

        // Add filter event listeners
        document.getElementById('filter-all').addEventListener('click', () => displayReleases(artistReleases, 'artist-releases'));
        document.getElementById('filter-singles').addEventListener('click', () => {
          const singles = artistReleases.filter(release => release.type === 'Single');
          displayReleases(singles, 'artist-releases');
        });
        document.getElementById('filter-eps').addEventListener('click', () => {
          const eps = artistReleases.filter(release => release.type === 'EP');
          displayReleases(eps, 'artist-releases');
        });
        document.getElementById('filter-albums').addEventListener('click', () => {
          const albums = artistReleases.filter(release => release.type === 'Album');
          displayReleases(albums, 'artist-releases');
        });
      }
    });
});


const songs = [
  {
    title: "Nuvu Naku Nenu Neku",
    artist: "Gemeni.AI",
    cover: "images/nknu.png",
    src: "songs/NNNN.mp4",
  },
  {
    title: "Agnipatham",
    artist: "Gemeni.AI",
    cover: "images/fire.png",
    src: "songs/Agnipatham.mp3",
  },
  {
    title: "RedLine",
    artist: "Gemeni.AI",
    cover: "images/redline.png",
    src: "songs/Redline_Defiance.mp3",
  },
  {
    title: "The Heavy Light",
    artist: "Gemeni.AI",
    cover: "images/heavy.png",
    src: "songs/The_Heavy_Light.mp3",
  },
  
    
];

// ─── GRADIENT FALLBACK COVERS ────────────────────────────────
// Beautiful gradient covers shown when image files are missing
const gradients = [
  "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#533483)",
  "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
  "linear-gradient(135deg,#200122,#6f0000)",
  "linear-gradient(135deg,#093028,#237a57)",
  "linear-gradient(135deg,#141e30,#243b55)",
  "linear-gradient(135deg,#360033,#0b8793)",
  "linear-gradient(135deg,#1a1a1a,#2d2d2d,#1DB954)",
  "linear-gradient(135deg,#0d0d0d,#1a3a2a,#0d5c3a)",
];

// ─── STATE ───────────────────────────────────────────────────
let currentIndex   = -1;
let isPlaying      = false;
let isShuffle      = false;
let isRepeat       = false;
let isMuted        = false;
let prevVolume     = 0.8;
let favorites      = JSON.parse(localStorage.getItem("vd_favorites") || "[]");
let recentlyPlayed = JSON.parse(localStorage.getItem("vd_recent") || "[]");
let isDraggingProgress = false;
let isDraggingVolume   = false;
let currentSection = "home";
let searchQuery    = "";

// ─── DOM REFS ────────────────────────────────────────────────
const audio          = document.getElementById("audio");
const playBtn        = document.getElementById("playBtn");
const playIcon       = document.getElementById("playIcon");
const pauseIcon      = document.getElementById("pauseIcon");
const prevBtn        = document.getElementById("prevBtn");
const nextBtn        = document.getElementById("nextBtn");
const shuffleBtn     = document.getElementById("shuffleBtn");
const repeatBtn      = document.getElementById("repeatBtn");
const muteBtn        = document.getElementById("muteBtn");
const volIcon        = document.getElementById("volIcon");
const muteIcon       = document.getElementById("muteIcon");
const heartBtn       = document.getElementById("heartBtn");
const progressWrap   = document.getElementById("progressWrap");
const progressFill   = document.getElementById("progressFill");
const progressThumb  = document.getElementById("progressThumb");
const currentTimeEl  = document.getElementById("currentTime");
const totalTimeEl    = document.getElementById("totalTime");
const volumeWrap     = document.getElementById("volumeWrap");
const volumeFill     = document.getElementById("volumeFill");
const volumeThumb    = document.getElementById("volumeThumb");
const playerCover    = document.getElementById("playerCover");
const playerTitle    = document.getElementById("playerTitle");
const playerArtist   = document.getElementById("playerArtist");
const homeGrid       = document.getElementById("homeGrid");
const songList       = document.getElementById("songList");
const favGrid        = document.getElementById("favGrid");
const favEmpty       = document.getElementById("favEmpty");
const recentGrid     = document.getElementById("recentGrid");
const recentEmpty    = document.getElementById("recentEmpty");
const featuredRow    = document.getElementById("featuredRow");
const searchInput    = document.getElementById("searchInput");
const songCountEl    = document.getElementById("songCount");
const npOverlay      = document.getElementById("npOverlay");
const npModal        = document.getElementById("npModal");
const npClose        = document.getElementById("npClose");
const npCover        = document.getElementById("npCover");
const npTitle        = document.getElementById("npTitle");
const npArtist       = document.getElementById("npArtist");
const sidebar        = document.getElementById("sidebar");
const mainContent    = document.getElementById("mainContent");
const menuToggle     = document.getElementById("menuToggle");
const snpCover       = document.getElementById("snpCover");
const snpTitle       = document.getElementById("snpTitle");
const snpArtist      = document.getElementById("snpArtist");
const sidebarNowPlaying = document.getElementById("sidebarNowPlaying");

// ─── INIT ────────────────────────────────────────────────────
function init() {
  audio.volume = 0.8;
  updateVolumeUI(0.8);
  songCountEl.textContent = `${songs.length} songs`;
  renderFeatured();
  renderGrid(homeGrid, songs);
  renderList();
  renderFavorites();
  renderRecent();
  bindEvents();
}

// ─── COVER HELPERS ───────────────────────────────────────────
function getCoverSrc(song, index) {
  return song.cover || "";
}

function createCoverImg(song, index, className = "") {
  const img = document.createElement("img");
  img.src = getCoverSrc(song, index);
  img.alt = song.title;
  if (className) img.className = className;

  // Fallback to gradient if image fails to load
  img.addEventListener("error", () => {
    img.style.display = "none";
    const parent = img.parentElement;
    if (parent) {
      parent.style.background = gradients[index % gradients.length];
    }
  });
  return img;
}

// ─── RENDER FEATURED ─────────────────────────────────────────
function renderFeatured() {
  featuredRow.innerHTML = "";
  const featured = songs.slice(0, 3);
  featured.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "featured-card";

    const img = createCoverImg(song, i);
    img.addEventListener("error", () => {
      img.style.cssText = `display:block;background:${gradients[i % gradients.length]};`;
    });

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <p class="ft-title">${song.title}</p>
      <p class="ft-artist">${song.artist}</p>
    `;

    const playBtnEl = document.createElement("button");
    playBtnEl.className = "ft-play";
    playBtnEl.setAttribute("aria-label", "Play");
    playBtnEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    playBtnEl.addEventListener("click", (e) => {
      e.stopPropagation();
      playSong(i);
    });

    card.appendChild(img);
    card.appendChild(overlay);
    card.appendChild(playBtnEl);
    card.addEventListener("click", () => playSong(i));

    featuredRow.appendChild(card);
  });
}

// ─── RENDER GRID (Cards) ─────────────────────────────────────
function renderGrid(container, songArr) {
  container.innerHTML = "";

  if (songArr.length === 0) {
    container.innerHTML = `<div class="no-results"><h3>No songs found</h3><p>Try a different search term.</p></div>`;
    return;
  }

  songArr.forEach((song) => {
    const realIndex = songs.indexOf(song);
    const isFav = favorites.includes(realIndex);
    const playing = realIndex === currentIndex && isPlaying;

    const card = document.createElement("div");
    card.className = `song-card${playing ? " playing" : ""}`;
    card.dataset.index = realIndex;

    const artWrap = document.createElement("div");
    artWrap.className = "card-art-wrap";
    artWrap.style.background = gradients[realIndex % gradients.length];

    const img = createCoverImg(song, realIndex);
    artWrap.appendChild(img);

    const heartEl = document.createElement("button");
    heartEl.className = `card-heart${isFav ? " favorited" : ""}`;
    heartEl.setAttribute("aria-label", "Favorite");
    heartEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    heartEl.addEventListener("click", (e) => { e.stopPropagation(); toggleFavorite(realIndex); });
    artWrap.appendChild(heartEl);

    const playBtnEl = document.createElement("button");
    playBtnEl.className = "card-play-btn";
    playBtnEl.setAttribute("aria-label", playing ? "Pause" : "Play");
    playBtnEl.innerHTML = playing
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    playBtnEl.addEventListener("click", (e) => {
      e.stopPropagation();
      if (realIndex === currentIndex) togglePlay();
      else playSong(realIndex);
    });
    artWrap.appendChild(playBtnEl);

    const indicator = playing
      ? `<div class="playing-indicator"><span></span><span></span><span></span></div>`
      : "";

    card.innerHTML = `<div class="card-title">${song.title}</div><div class="card-artist">${song.artist}</div>${indicator}`;
    card.prepend(artWrap);
    card.addEventListener("click", () => playSong(realIndex));

    container.appendChild(card);
  });
}

// ─── RENDER LIST ─────────────────────────────────────────────
function renderList() {
  songList.innerHTML = `
    <div class="list-header">
      <div>#</div>
      <div></div>
      <div>Title</div>
      <div>Artist</div>
      <div style="text-align:right;">Duration</div>
      <div></div>
    </div>
  `;

  const filtered = searchQuery
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery) ||
        s.artist.toLowerCase().includes(searchQuery)
      )
    : songs;

  if (filtered.length === 0) {
    songList.innerHTML += `<div class="no-results"><h3>No songs found</h3><p>Try a different search term.</p></div>`;
    return;
  }

  filtered.forEach((song, idx) => {
    const realIndex = songs.indexOf(song);
    const isFav = favorites.includes(realIndex);
    const playing = realIndex === currentIndex;

    const item = document.createElement("div");
    item.className = `song-list-item${playing ? " playing" : ""}`;
    item.dataset.index = realIndex;

    const img = document.createElement("img");
    img.src = song.cover || "";
    img.className = "sli-img";
    img.alt = song.title;
    img.style.background = gradients[realIndex % gradients.length];
    img.addEventListener("error", () => { img.style.display = "none"; });

    item.innerHTML = `
      <div class="sli-num">
        <span>${idx + 1}</span>
        <span class="sli-play-icon">
          ${playing && isPlaying
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
          }
        </span>
      </div>
    `;
    item.appendChild(img);
    item.innerHTML += `
      <div class="sli-title" style="color:${playing ? 'var(--green)' : ''}">${song.title}</div>
      <div class="sli-artist">${song.artist}</div>
      <div class="sli-duration" id="dur-${realIndex}">—</div>
      <button class="sli-heart${isFav ? " favorited" : ""}" aria-label="Favorite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${isFav ? '#ff4d6d' : ''}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    `;

    item.querySelector(".sli-heart").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(realIndex);
    });

    item.addEventListener("click", () => {
      if (realIndex === currentIndex) togglePlay();
      else playSong(realIndex);
    });

    songList.appendChild(item);

    // Load duration
    loadDuration(song.src, realIndex);
  });
}

function loadDuration(src, index) {
  const el = document.getElementById(`dur-${index}`);
  if (!el) return;
  const tmp = new Audio();
  tmp.src = src;
  tmp.addEventListener("loadedmetadata", () => {
    if (el) el.textContent = formatTime(tmp.duration);
    tmp.src = "";
  });
  tmp.addEventListener("error", () => { if (el) el.textContent = "—"; });
}

// ─── RENDER FAVORITES ────────────────────────────────────────
function renderFavorites() {
  favGrid.innerHTML = "";
  const favSongs = favorites.map(i => songs[i]).filter(Boolean);
  if (favSongs.length === 0) {
    favEmpty.style.display = "block";
  } else {
    favEmpty.style.display = "none";
    renderGrid(favGrid, favSongs);
  }
}

// ─── RENDER RECENT ───────────────────────────────────────────
function renderRecent() {
  recentGrid.innerHTML = "";
  const recentSongs = recentlyPlayed.map(i => songs[i]).filter(Boolean);
  if (recentSongs.length === 0) {
    recentEmpty.style.display = "block";
  } else {
    recentEmpty.style.display = "none";
    renderGrid(recentGrid, recentSongs);
  }
}

// ─── PLAY A SONG ─────────────────────────────────────────────
function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  const song = songs[index];
  currentIndex = index;

  audio.src = song.src;
  audio.load();
  audio.play().catch(() => {
    // Gracefully handle missing audio files
    showToast(`🎵 "${song.title}" — add your MP3 to /songs/ to hear it!`);
  });

  isPlaying = true;
  updatePlayerUI(song);
  updatePlayState();
  addToRecent(index);
  refreshAllGrids();
}

function updatePlayerUI(song) {
  playerTitle.textContent  = song.title;
  playerArtist.textContent = song.artist;
  npTitle.textContent      = song.title;
  npArtist.textContent     = song.artist;
  snpTitle.textContent     = song.title;
  snpArtist.textContent    = song.artist;

  // Cover
  const src = song.cover || "";
  [playerCover, npCover, snpCover].forEach(img => {
    img.src = src;
    const idx = currentIndex;
    img.addEventListener("error", () => {
      img.style.background = gradients[idx % gradients.length];
      img.style.borderRadius = img === playerCover ? "8px" : "";
    }, { once: true });
  });

  // Spinning cover
  playerCover.classList.add("spinning");

  // Sidebar now playing
  sidebarNowPlaying.style.display = "block";

  // Update heart state
  const isFav = favorites.includes(currentIndex);
  heartBtn.classList.toggle("favorited", isFav);
  heartBtn.querySelector("svg").setAttribute("fill", isFav ? "currentColor" : "none");

  // Document title
  document.title = `${song.title} — ${song.artist} | Verdant`;
}

function updatePlayState() {
  playIcon.style.display  = isPlaying ? "none" : "";
  pauseIcon.style.display = isPlaying ? "" : "none";
  if (isPlaying) {
    playerCover.classList.add("spinning");
  } else {
    playerCover.classList.remove("spinning");
  }
}

// ─── PLAY / PAUSE ────────────────────────────────────────────
function togglePlay() {
  if (currentIndex === -1) { playSong(0); return; }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
  }
  updatePlayState();
  refreshAllGrids();
}

// ─── NEXT / PREV ─────────────────────────────────────────────
function nextSong() {
  if (songs.length === 0) return;
  let next;
  if (isShuffle) {
    do { next = Math.floor(Math.random() * songs.length); } while (next === currentIndex && songs.length > 1);
  } else {
    next = (currentIndex + 1) % songs.length;
  }
  playSong(next);
}

function prevSong() {
  if (songs.length === 0) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const prev = (currentIndex - 1 + songs.length) % songs.length;
  playSong(prev);
}

// ─── FAVORITES ───────────────────────────────────────────────
function toggleFavorite(index) {
  const i = favorites.indexOf(index);
  if (i > -1) {
    favorites.splice(i, 1);
    showToast("Removed from favorites");
  } else {
    favorites.push(index);
    showToast("Added to favorites ♥");
  }
  localStorage.setItem("vd_favorites", JSON.stringify(favorites));

  // Update heart button in player
  if (index === currentIndex) {
    const isFav = favorites.includes(index);
    heartBtn.classList.toggle("favorited", isFav);
    heartBtn.querySelector("svg").setAttribute("fill", isFav ? "currentColor" : "none");
  }

  refreshAllGrids();
}

// ─── RECENTLY PLAYED ─────────────────────────────────────────
function addToRecent(index) {
  recentlyPlayed = recentlyPlayed.filter(i => i !== index);
  recentlyPlayed.unshift(index);
  if (recentlyPlayed.length > 12) recentlyPlayed = recentlyPlayed.slice(0, 12);
  localStorage.setItem("vd_recent", JSON.stringify(recentlyPlayed));
}

// ─── REFRESH GRIDS ───────────────────────────────────────────
function refreshAllGrids() {
  const filtered = searchQuery
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery) ||
        s.artist.toLowerCase().includes(searchQuery)
      )
    : songs;

  renderGrid(homeGrid, filtered);
  renderList();
  renderFavorites();
  renderRecent();
}

// ─── PROGRESS BAR ────────────────────────────────────────────
audio.addEventListener("timeupdate", () => {
  if (isDraggingProgress || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width  = pct + "%";
  progressThumb.style.left  = pct + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    isPlaying = false;
    nextSong();
  }
});

function seekTo(e) {
  const rect = progressWrap.getBoundingClientRect();
  const x    = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const pct  = x / rect.width;
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    progressFill.style.width = (pct * 100) + "%";
    progressThumb.style.left = (pct * 100) + "%";
  }
}

progressWrap.addEventListener("mousedown", (e) => {
  isDraggingProgress = true;
  seekTo(e);
});
document.addEventListener("mousemove", (e) => {
  if (isDraggingProgress) seekTo(e);
});
document.addEventListener("mouseup", () => { isDraggingProgress = false; });

// Touch support for progress
progressWrap.addEventListener("touchstart", (e) => {
  isDraggingProgress = true;
  seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener("touchmove", (e) => {
  if (isDraggingProgress) seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener("touchend", () => { isDraggingProgress = false; });

// ─── VOLUME ──────────────────────────────────────────────────
function setVolume(e) {
  const rect = volumeWrap.getBoundingClientRect();
  const x    = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const vol  = x / rect.width;
  audio.volume  = vol;
  prevVolume    = vol;
  updateVolumeUI(vol);
  if (vol > 0 && isMuted) { isMuted = false; updateMuteIcon(); }
}

function updateVolumeUI(vol) {
  const pct = vol * 100;
  volumeFill.style.width  = pct + "%";
  volumeThumb.style.left  = pct + "%";
}

volumeWrap.addEventListener("mousedown", (e) => { isDraggingVolume = true; setVolume(e); });
document.addEventListener("mousemove", (e) => { if (isDraggingVolume) setVolume(e); });
document.addEventListener("mouseup", () => { isDraggingVolume = false; });

volumeWrap.addEventListener("touchstart", (e) => { isDraggingVolume = true; setVolume(e.touches[0]); }, { passive: true });
document.addEventListener("touchmove", (e) => { if (isDraggingVolume) setVolume(e.touches[0]); }, { passive: true });
document.addEventListener("touchend", () => { isDraggingVolume = false; });

function updateMuteIcon() {
  volIcon.style.display  = isMuted ? "none" : "";
  muteIcon.style.display = isMuted ? "" : "none";
}

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  if (isMuted) {
    prevVolume    = audio.volume || 0.8;
    audio.volume  = 0;
    updateVolumeUI(0);
  } else {
    audio.volume = prevVolume;
    updateVolumeUI(prevVolume);
  }
  updateMuteIcon();
});

// ─── SHUFFLE / REPEAT ────────────────────────────────────────
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  showToast(isShuffle ? "Shuffle on" : "Shuffle off");
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
  showToast(isRepeat ? "Repeat on" : "Repeat off");
});

// ─── PLAYER CONTROLS ─────────────────────────────────────────
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);

heartBtn.addEventListener("click", () => {
  if (currentIndex === -1) return;
  toggleFavorite(currentIndex);
});

// ─── NOW PLAYING MODAL ───────────────────────────────────────
playerCover.addEventListener("click", () => npOverlay.classList.add("open"));
playerTitle.addEventListener("click", () => npOverlay.classList.add("open"));

npClose.addEventListener("click", () => npOverlay.classList.remove("open"));
npOverlay.addEventListener("click", (e) => {
  if (e.target === npOverlay) npOverlay.classList.remove("open");
});

// ─── SIDEBAR TOGGLE ──────────────────────────────────────────
let sidebarOpen = window.innerWidth > 900;

menuToggle.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle("open", sidebarOpen);
  sidebar.classList.toggle("hidden", !sidebarOpen);
  mainContent.classList.toggle("expanded", !sidebarOpen);
});

// ─── NAVIGATION ──────────────────────────────────────────────
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const target = item.dataset.section;
    switchSection(target);
    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
      sidebarOpen = false;
      sidebar.classList.remove("open");
    }
  });
});

document.querySelectorAll(".see-all").forEach(el => {
  el.addEventListener("click", () => switchSection(el.dataset.target));
});

function switchSection(name) {
  currentSection = name;
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(`section-${name}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(i => {
    i.classList.toggle("active", i.dataset.section === name);
  });
  // Scroll to top
  mainContent.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── SEARCH ──────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();

  if (searchQuery) {
    switchSection("home");
    document.querySelector(".section-title").innerHTML = `Results for "<span class="accent">${searchQuery}</span>"`;
    document.querySelector(".section-sub").textContent  = "Search results";
  } else {
    document.querySelector(".section-title").innerHTML = `Good to see you <span class="accent">🎵</span>`;
    document.querySelector(".section-sub").textContent  = "Your personal music universe";
  }

  refreshAllGrids();
});

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
document.addEventListener("keydown", (e) => {
  // Don't fire when typing in search
  if (document.activeElement === searchInput) return;

  switch (e.code) {
    case "Space":      e.preventDefault(); togglePlay(); break;
    case "ArrowRight": audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); break;
    case "ArrowLeft":  audio.currentTime = Math.max(0, audio.currentTime - 10); break;
    case "ArrowUp":    audio.volume = Math.min(1, audio.volume + 0.1); updateVolumeUI(audio.volume); break;
    case "ArrowDown":  audio.volume = Math.max(0, audio.volume - 0.1); updateVolumeUI(audio.volume); break;
    case "KeyN":       nextSong(); break;
    case "KeyP":       prevSong(); break;
    case "Escape":     npOverlay.classList.remove("open"); break;
  }
});

// ─── BIND EVENTS (for elements that need setup) ──────────────
function bindEvents() {
  // Sidebar now playing card opens modal
  document.querySelector(".snp-card").addEventListener("click", () => {
    if (currentIndex !== -1) npOverlay.classList.add("open");
  });
}

// ─── UTILITY ─────────────────────────────────────────────────
function formatTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

let toastTimeout;
function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ─── RESPONSIVE INIT ─────────────────────────────────────────
if (window.innerWidth <= 900) {
  sidebarOpen = false;
  sidebar.classList.add("hidden");
}

// ─── START ───────────────────────────────────────────────────
init();

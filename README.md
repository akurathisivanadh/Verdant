# 🎵 Verdant Music Player

A beautiful Spotify-inspired music player built with pure HTML, CSS & JavaScript.

---

## 🚀 How to Run

Just open `index.html` in your browser. That's it!

> **Tip:** If you use VS Code, install the **Live Server** extension and click "Go Live" for the best experience (some browsers restrict local file loading).

---

## 🎧 Adding Your Own Songs

### Step 1 — Add MP3 files
Put your `.mp3` files inside the `/songs/` folder:
```
songs/
  song1.mp3
  song2.mp3
  song3.mp3
```

### Step 2 — Add Album Covers
Put your cover art (JPG/PNG) inside the `/images/` folder:
```
images/
  cover1.jpg
  cover2.jpg
  cover3.jpg
```
> Recommended size: **500×500px** square images work best.

### Step 3 — Update the song list in `script.js`
Open `script.js` and find the `songs` array at the top. Edit it like this:

```js
const songs = [
  {
    title: "Your Song Title",
    artist: "Artist Name",
    cover: "images/your-cover.jpg",   // path to your image
    src: "songs/your-song.mp3",       // path to your MP3
  },
  // Add more songs...
];
```

> **No image?** No problem! The player automatically shows a beautiful gradient cover if an image file is missing.

> **No MP3?** A toast message will appear to let you know the file is missing — add the file and it plays instantly.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Skip forward 10 seconds |
| `←` | Skip back 10 seconds |
| `↑` | Volume up |
| `↓` | Volume down |
| `N` | Next song |
| `P` | Previous song |
| `Esc` | Close Now Playing modal |

---

## ✨ Features

- 🎵 Play, pause, next, previous
- 🔀 Shuffle mode
- 🔁 Repeat mode
- ❤️ Favorite songs (saved across sessions)
- 🕐 Recently played (saved across sessions)
- 🔍 Live search by title or artist
- 🔊 Volume control + mute
- ⏱️ Draggable progress bar
- 🌙 Now Playing modal with glowing animation
- 📱 Responsive for mobile
- ⌨️ Keyboard shortcuts

---

## 📁 File Structure

```
music-player/
├── index.html      — App structure
├── style.css       — All styling & animations
├── script.js       — All logic & song data
├── songs/          — Put your MP3 files here
├── images/         — Put your cover art here
└── README.md       — This file
```

---

## 🎨 Customization

**Change accent color** — Find `--green: #1DB954;` in `style.css` and change it to any color you like.

**Add more songs** — Just add entries to the `songs` array in `script.js`.

**Change the app name** — Search for "Verdant" in `index.html` and `script.js`.

---

Built with ❤️ using pure HTML, CSS & JavaScript — no frameworks, no dependencies.

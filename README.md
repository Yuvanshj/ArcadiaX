# ArcadiaX

A gaming dashboard and mini-game platform built with vanilla HTML, CSS, and JavaScript. ArcadiaX brings together multiple games under a clean, dark-themed interface with a focus on fast, casual gameplay.

---

## Games

### Who's That Pokémon?
Guess the Pokémon from its silhouette. A new Pokémon is pulled from the PokéAPI on every round — all 1025 of them. The silhouette slowly idles until you guess correctly or hit reveal, with a running score and streak counter.

### Guess & Learn Trivia
A timed multiple-choice trivia game powered by the Open Trivia DB. Pick a category and difficulty, then answer 10 questions before the timer runs out. Scoring gives bonus points based on how fast you answer.

### Higher or Lower: Game Ratings
Two video games appear side by side. Pick which one has the higher Metacritic score and keep your streak alive. Filter by genre (RPG, Shooter, Action, etc.) before playing. Powered by a local dataset of 50 real games with real Metacritic scores.

---

## JavaScript Features

### Array Higher-Order Functions
Every interactive feature uses HOFs — no traditional loops for data processing.

| Feature | HOF Used |
|---|---|
| Genre filter chips | `map()` over unique genres via `new Set(GAMES.map(...))` |
| Filter games by genre | `filter()` |
| Shuffle game pool | `map()` + `sort()` |
| Render badge elements | `map()` + `join()` |
| Search games by title | `filter()` |
| Get unique genre list | `map()` + `Set` + spread |

### Other Features
- `localStorage` for high score / streak persistence (Higher or Lower, Trivia)
- Loading state during API fetch (Pokémon game)
- Error handling for failed API calls
- Fully responsive layout across mobile, tablet, desktop

---

## Tech Stack

- HTML, CSS, JavaScript — no frameworks, no build tools
- [PokéAPI](https://pokeapi.co/) — Pokémon data and sprites
- [Open Trivia DB](https://opentdb.com/api_config.php) — trivia questions
- Google Fonts (Outfit)
- localStorage — high score persistence

---

## Project Structure

```
ArcadiaX/
├── index.html              # Main dashboard
├── assets/                 # Cover art and background images
├── gameshtml/
│   ├── pokemon.html        # Who's That Pokémon game
│   └── trivia.html         # Guess & Learn Trivia game
├── CSS/
│   ├── dashboard.css       # Dashboard styles
│   ├── style.css           # Pokémon game styles
│   └── trivia.css          # Trivia game styles
└── JS/
    ├── dashboard.js        # Search bar logic
    ├── Pokemon.js          # Pokémon game logic
    └── Trivia.js           # Trivia game logic
```

---

## Running Locally

No build step needed. Just open `index.html` in your browser, or serve it with any static file server:

```bash
npx serve .
```

---

## Author

Yuvansh Juneja

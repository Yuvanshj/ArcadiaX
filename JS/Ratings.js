const apiKey = '98e3701116824de3be3e97aa3ff39628';
const rawgBase = 'https://api.rawg.io/api/games?key=' + apiKey + '&ordering=-ratings_count&page_size=40';

let games = [];
let pool = [];
let left = null;
let right = null;
let streak = 0;
let round = 0;
let best = parseInt(localStorage.getItem('ratingsHigh') || '0');
let picked = false;
let genre = 'All';
let query = '';

const setupEl = document.getElementById('setupScreen');
const gameEl = document.getElementById('gameScreen');
const resultsEl = document.getElementById('resultsScreen');
const startBtn = document.getElementById('btnStart');
const statusEl = document.getElementById('loadStatus');

async function loadGames() {
    startBtn.disabled = true;
    statusEl.textContent = 'Loading games...';
    statusEl.style.color = 'rgba(255,255,255,0.4)';

    try {
        const urls = [
            rawgBase + '&metacritic=78,100&page=1',
            rawgBase + '&metacritic=78,100&page=2',
            rawgBase + '&metacritic=40,77&page=1',
            rawgBase + '&metacritic=40,77&page=2',
        ];

        const responses = await Promise.all(urls.map(u => fetch(u)));
        const data = await Promise.all(responses.map(r => r.json()));

        games = data
            .flatMap(d => d.results)
            .filter(g => g.metacritic && g.background_image)
            .map(g => ({
                name: g.name,
                score: g.metacritic,
                img: g.background_image,
                genres: g.genres.map(x => x.name),
                year: g.released ? g.released.slice(0, 4) : null,
            }));

        buildChips();
        cacheImages(games);
        statusEl.style.display = 'none';
        startBtn.disabled = false;
    } catch (e) {
        statusEl.textContent = 'Failed to load. Check your connection.';
        statusEl.style.color = '#f87171';
    }
}

function cacheImages(list) {
    list.forEach(g => {
        new Image().src = g.img;
    });
}

function buildChips() {
    const container = document.getElementById('genreFilters');
    container.innerHTML = '';

    const all = ['All', ...[...new Set(games.flatMap(g => g.genres))].sort()];

    all.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'genre-chip' + (g === 'All' ? ' active' : '');
        btn.textContent = g;
        btn.onclick = () => {
            genre = g;
            container.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
        };
        container.appendChild(btn);
    });
}

function getPool() {
    const q = query.toLowerCase().trim();
    return games
        .filter(g => genre === 'All' || g.genres.includes(genre))
        .filter(g => !q || g.name.toLowerCase().includes(q));
}

function shuffle(arr) {
    return arr
        .map(item => ({ item, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(x => x.item);
}

function startGame() {
    const filtered = getPool();
    if (filtered.length < 4) {
        alert('Not enough games. Try "All" or clear the search.');
        return;
    }

    streak = 0;
    round = 0;
    pool = shuffle(filtered);
    show(gameEl);
    nextRound();
}

function nextRound() {
    picked = false;
    round++;

    if (pool.length < 2) pool = shuffle(getPool());

    left = pool.pop();
    right = pool.pop();

    let tries = 0;
    while (left.score === right.score && tries < 15) {
        pool.unshift(right);
        right = pool.pop();
        tries++;
    }

    fillCard('Left', left);
    fillCard('Right', right);
    preloadNext();

    document.getElementById('streakDisplay').textContent = streak;
    document.getElementById('roundNum').textContent = round;

    document.getElementById('cardLeft').className = 'game-card';
    document.getElementById('cardRight').className = 'game-card';
    document.getElementById('cardLeft').onclick = () => guess('left');
    document.getElementById('cardRight').onclick = () => guess('right');
}

function preloadNext() {
    if (pool.length < 2) return;
    [pool[pool.length - 1], pool[pool.length - 2]].forEach(g => {
        new Image().src = g.img;
    });
}

function fillCard(side, game) {
    document.getElementById('bg' + side).style.backgroundImage = `url('${game.img}')`;
    document.getElementById('bg' + side).style.backgroundSize = 'cover';
    document.getElementById('bg' + side).style.backgroundPosition = 'center';

    const tags = [...game.genres.slice(0, 2), ...(game.year ? [game.year] : [])];
    document.getElementById('badges' + side).innerHTML = tags
        .map(t => `<span class="tag">${t}</span>`)
        .join('');

    document.getElementById('title' + side).textContent = game.name;
    document.getElementById('score' + side).textContent = '?';
    document.getElementById('score' + side).className = 'meta-badge';
}

function guess(side) {
    if (picked) return;
    picked = true;

    const chosen = side === 'left' ? left : right;
    const other = side === 'left' ? right : left;
    const correct = chosen.score >= other.score;

    revealCards();

    document.getElementById('cardLeft').onclick = null;
    document.getElementById('cardRight').onclick = null;

    if (correct) {
        streak++;
        document.getElementById('streakDisplay').textContent = streak;
        setTimeout(nextRound, 2000);
    } else {
        if (streak > best) {
            best = streak;
            localStorage.setItem('ratingsHigh', best);
        }
        setTimeout(gameOver, 2200);
    }
}

function revealCards() {
    const leftWins = left.score >= right.score;

    const styleScore = (sideKey, game, other) => {
        const el = document.getElementById('score' + sideKey);
        el.textContent = game.score;
        el.className = 'meta-badge ' + (game.score > other.score ? 'winner' : game.score < other.score ? 'loser' : 'tie');
    };

    styleScore('Left', left, right);
    styleScore('Right', right, left);

    document.getElementById('cardLeft').classList.add(leftWins ? 'card-winner' : 'card-loser');
    document.getElementById('cardRight').classList.add(leftWins ? 'card-loser' : 'card-winner');
}

function gameOver() {
    document.getElementById('finalStreak').textContent = streak;
    document.getElementById('finalBest').textContent = best;
    show(resultsEl);
}

function show(el) {
    [setupEl, gameEl, resultsEl].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
}

document.getElementById('highStreakDisplay').textContent = best;

document.getElementById('searchInput').addEventListener('input', e => {
    query = e.target.value;
});

startBtn.addEventListener('click', startGame);

document.getElementById('btnPlayAgain').addEventListener('click', () => {
    document.getElementById('highStreakDisplay').textContent = best;
    show(setupEl);
});

loadGames();

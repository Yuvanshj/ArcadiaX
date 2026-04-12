let pokemonList = [];
let nextPokemonData = null;
let currentPokemonData = null;
let score = 0;
let streak = 0;
let isRevealed = false;

// ===== UTILITY =====
function getRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const selectedPokemon = pokemonList[randomIndex];
    const urlParts = selectedPokemon.url.split("/");
    const id = urlParts[urlParts.length - 2];
    const png = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    return { name: selectedPokemon.name, id: id, png: png };
}

function preloadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
    });
}

// ===== DATA FETCHING =====
async function getPokemonData() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await response.json();
        pokemonList = data.results;

        // Load first Pokémon
        currentPokemonData = getRandomPokemon();
        await preloadImage(currentPokemonData.png);
        displayPokemon(currentPokemonData);

        // Prefetch next
        nextPokemonData = getRandomPokemon();
        preloadImage(nextPokemonData.png);

        // Hide loading, show game
        document.getElementById("loadingScreen").classList.add("hidden");
        document.getElementById("gameScreen").classList.remove("hidden");

        // Focus the input
        document.getElementById("guessInput").focus();
    } catch (error) {
        console.error("Failed to fetch Pokémon data:", error);
    }
}

// ===== DISPLAY =====
function displayPokemon(pokemonData) {
    const pokemonImage = document.getElementById("pokemonsilhouette");
    const nameReveal = document.getElementById("nameReveal");
    if (!pokemonImage) return;

    pokemonImage.src = pokemonData.png;
    pokemonImage.classList.remove("revealed");
    pokemonImage.dataset.name = pokemonData.name;
    nameReveal.classList.add("hidden");
    isRevealed = false;

    // Clear the input
    const input = document.getElementById("guessInput");
    input.value = "";
    input.disabled = false;
    input.focus();

    // Enable buttons
    document.getElementById("btnGuess").disabled = false;
    document.getElementById("btnReveal").disabled = false;
}

// ===== GAME LOGIC =====
function submitGuess() {
    if (isRevealed || !currentPokemonData) return;

    const input = document.getElementById("guessInput");
    const guess = input.value.trim().toLowerCase();

    if (!guess) {
        shakeInput();
        return;
    }

    const correctName = currentPokemonData.name.toLowerCase();

    if (guess === correctName) {
        // Correct!
        score++;
        streak++;
        updateScore();
        revealPokemon();
        showFeedback("Correct! ✨", "correct");
    } else {
        // Incorrect
        streak = 0;
        updateScore();
        showFeedback(`Nope! It's ${currentPokemonData.name}`, "incorrect");
        revealPokemon();
    }

    input.disabled = true;
    document.getElementById("btnGuess").disabled = true;
}

function revealPokemon() {
    if (isRevealed) return;
    isRevealed = true;

    const pokemonImage = document.getElementById("pokemonsilhouette");
    const nameReveal = document.getElementById("nameReveal");
    const revealedName = document.getElementById("revealedName");

    if (pokemonImage) {
        pokemonImage.classList.add("revealed");
    }

    revealedName.textContent = `It's ${currentPokemonData.name}!`;
    nameReveal.classList.remove("hidden");

    document.getElementById("btnReveal").disabled = true;
    document.getElementById("guessInput").disabled = true;
    document.getElementById("btnGuess").disabled = true;

    // If revealed without guessing, break streak
    if (!document.getElementById("guessInput").value.trim()) {
        streak = 0;
        updateScore();
    }
}

function nextPokemon() {
    if (pokemonList.length === 0) return;

    // Hide any feedback
    hideFeedback();

    if (nextPokemonData) {
        currentPokemonData = nextPokemonData;
        displayPokemon(currentPokemonData);

        // Prefetch next
        nextPokemonData = getRandomPokemon();
        preloadImage(nextPokemonData.png);
    } else {
        currentPokemonData = getRandomPokemon();
        displayPokemon(currentPokemonData);

        nextPokemonData = getRandomPokemon();
        preloadImage(nextPokemonData.png);
    }
}

function updateScore() {
    document.getElementById("scoreValue").textContent = score;
    document.getElementById("streakValue").textContent = `${streak} 🔥`;
}

// ===== FEEDBACK =====
function showFeedback(text, type) {
    const toast = document.getElementById("feedbackToast");
    const feedbackText = document.getElementById("feedbackText");

    // Remove previous classes
    toast.classList.remove("hidden", "correct", "incorrect");
    toast.style.animation = "none";
    // Force reflow
    void toast.offsetWidth;

    feedbackText.textContent = text;
    toast.classList.add(type);
    toast.style.animation = "toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards";

    // Auto hide after 2s
    setTimeout(() => {
        toast.style.animation = "toast-out 0.4s ease forwards";
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 400);
    }, 2000);
}

function hideFeedback() {
    const toast = document.getElementById("feedbackToast");
    toast.classList.add("hidden");
}

function shakeInput() {
    const input = document.getElementById("guessInput");
    input.style.animation = "none";
    void input.offsetWidth;
    input.style.animation = "shake 0.4s ease";
    setTimeout(() => { input.style.animation = ""; }, 400);
}

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {
    // Enter key to guess
    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            submitGuess();
        }
    });
});

// ===== INIT =====
getPokemonData();
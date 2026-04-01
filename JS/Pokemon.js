let pokemonList = [];

async function getPokemonData() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await response.json();
        pokemonList = data.results;
        console.log(pokemonList)
        startGame();
    } catch (error) {
        console.error("Failed to fetch Pokemon data: ", error);
    }
}


function startGame() {
    const pokemonName = document.getElementById("pokemonName");
    const PokemonImage = document.getElementById("pokemonsilhouette");
    if (!PokemonImage) return;

    if (pokemonList.length === 0) {
        console.log("Pokemon data is still loading...");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const selectedPokemon = pokemonList[randomIndex];

    const urlParts = selectedPokemon.url.split("/");
    const id = urlParts[urlParts.length - 2];

    const png = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    PokemonImage.src = png;
    PokemonImage.classList.remove("revealed");
    
    PokemonImage.dataset.name = selectedPokemon.name;
    pokemonName.innerText = selectedPokemon.name;
}

function revealPokemon() {
    const PokemonImage = document.getElementById("pokemonsilhouette");
    if (PokemonImage) {
        PokemonImage.classList.add("revealed");
    }
}

getPokemonData();
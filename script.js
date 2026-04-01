let pokemonData = [];

async function fetchPokemon() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
    const data = await response.json();

    const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return await res.json();
        })
    );

    pokemonData = detailedData;
    displayPokemon(pokemonData);
}

function displayPokemon(pokemonList) {
    const container = document.getElementById("pokemon-container");
    container.innerHTML = "";

    pokemonList.forEach(pokemon => {
        const card = document.createElement("div");

        const img = document.createElement("img");
        img.src = pokemon.sprites.front_default;

        const name = document.createElement("h3");
        name.innerText = pokemon.name;

        card.appendChild(img);
        card.appendChild(name);

        container.appendChild(card);
        const type = document.createElement("p");
        type.innerText = pokemon.types.map(t => t.type.name).join(", ");
        card.appendChild(type);
    });
}

fetchPokemon();

const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = pokemonData.filter(pokemon =>
        pokemon.name.includes(value)
    );

    displayPokemon(filtered);
});

const filterSelect = document.getElementById("filter");

filterSelect.addEventListener("change", () => {
    const selectedType = filterSelect.value;

    if (selectedType === "") {
        displayPokemon(pokemonData);
        return;
    }

    const filtered = pokemonData.filter(pokemon =>
        pokemon.types.some(t => t.type.name === selectedType)
    );

    displayPokemon(filtered);
});

const sortSelect = document.getElementById("sort");

sortSelect.addEventListener("change", () => {
    const value = sortSelect.value;

    let sorted = [...pokemonData]; // copy array

    if (value === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayPokemon(sorted);
});
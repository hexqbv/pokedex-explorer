const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";

const pokemonGrid = document.getElementById("pokemonGrid");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");

let allPokemon = [];
let filteredPokemon = [];
let favorites = [];
let expandedPokemonId = null;
let isDarkMode = false;

async function fetchPokemonList() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const detailPromises = data.results.map(async (pokemon) => {
      const detailRes = await fetch(pokemon.url);
      return detailRes.json();
    });

    allPokemon = await Promise.all(detailPromises);
    applyFiltersAndSort();
  } catch (error) {
    pokemonGrid.innerHTML =
      '<p class="empty-state">Failed to load Pokemon data. Please try again.</p>';
    // Keeps error visible in developer tools for debugging.
    console.error("Error fetching Pokemon:", error);
  }
}

function applyFiltersAndSort() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const sortOrder = sortSelect.value;

  filteredPokemon = allPokemon.filter((pokemon) => {
    const nameMatches = pokemon.name.toLowerCase().includes(searchTerm);
    const typeMatches =
      selectedType === "all" ||
      pokemon.types.some((entry) => entry.type.name === selectedType);

    return nameMatches && typeMatches;
  });

  filteredPokemon.sort((a, b) => {
    if (sortOrder === "za") {
      return b.name.localeCompare(a.name);
    }
    return a.name.localeCompare(b.name);
  });

  if (!filteredPokemon.some((pokemon) => pokemon.id === expandedPokemonId)) {
    expandedPokemonId = null;
  }

  renderGrid(filteredPokemon);
}

function renderGrid(pokemonList) {
  if (pokemonList.length === 0) {
    pokemonGrid.innerHTML = '<p class="empty-state">No Pokemon found.</p>';
    return;
  }

  pokemonGrid.innerHTML = pokemonList
    .map((pokemon) => {
      const staticImage =
        pokemon.sprites.front_default ||
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
      const types = pokemon.types.map((entry) => entry.type.name).join(", ");
      const isFavorite = favorites.includes(pokemon.id);
      const isExpanded = expandedPokemonId === pokemon.id;
      const gifUrl = `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase()}.gif`;
      const cardImage = isExpanded ? gifUrl : staticImage;
      const imageErrorHandler = isExpanded
        ? `this.onerror=null;this.src='${staticImage}'`
        : "";
      const statsHtml = pokemon.stats
        .map((entry) => `<li>${entry.stat.name.toUpperCase()}: ${entry.base_stat}</li>`)
        .join("");
      const expandedHtml = isExpanded
        ? `
          <div class="expanded-content">
            <div class="expanded-top">
              <div>
                <p><strong>Height:</strong> ${pokemon.height}</p>
                <p><strong>Weight:</strong> ${pokemon.weight}</p>
                <p><strong>Stats:</strong></p>
              </div>
            </div>
            <ul class="stats-list">${statsHtml}</ul>
          </div>
        `
        : "";

      return `
        <article class="pokemon-card ${isExpanded ? "expanded" : ""}" data-id="${pokemon.id}">
          <div class="card-header">
            <button
              class="favorite-btn"
              type="button"
              data-favorite-id="${pokemon.id}"
              aria-label="Toggle favorite for ${pokemon.name}"
            >
              ${isFavorite ? "⭐" : "☆"}
            </button>
          </div>
          <img src="${cardImage}" alt="${pokemon.name}" onerror="${imageErrorHandler}" />
          <p class="pokemon-types">${types}</p>
          <h3 class="pokemon-name">${pokemon.name.toUpperCase()}</h3>
          ${expandedHtml}
        </article>
      `;
    })
    .join("");
}

function toggleFavorite(pokemonId) {
  if (favorites.includes(pokemonId)) {
    favorites = favorites.filter((id) => id !== pokemonId);
  } else {
    favorites.push(pokemonId);
  }
  renderGrid(filteredPokemon);
}

function toggleExpandedCard(pokemonId) {
  // Keep one expanded card at a time; clicking it again collapses it.
  expandedPokemonId = expandedPokemonId === pokemonId ? null : pokemonId;
  renderGrid(filteredPokemon);
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark", isDarkMode);
  themeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
}

pokemonGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest(".favorite-btn");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(Number(favoriteButton.dataset.favoriteId));
    return;
  }

  const card = event.target.closest(".pokemon-card");
  if (!card) return;

  toggleExpandedCard(Number(card.dataset.id));
});

searchInput.addEventListener("input", applyFiltersAndSort);
typeFilter.addEventListener("change", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);
themeToggle.addEventListener("click", toggleTheme);

fetchPokemonList();

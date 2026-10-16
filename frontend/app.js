const API_BASE_URL = "http://localhost:8000/api/v1";
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
    loadGenres();
    loadMovies();

    document.getElementById("genreFilter").addEventListener("change", () => { currentPage = 1; loadMovies(); });
    document.getElementById("sortBy").addEventListener("change", () => { currentPage = 1; loadMovies(); });
    document.getElementById("sortOrder").addEventListener("change", () => { currentPage = 1; loadMovies(); });
});

async function loadGenres() {
    try {
        const response = await fetch(`${API_BASE_URL}/genres`);
        const genres = await response.json();
        const genreSelect = document.getElementById("genreFilter");

        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load genres:", error);
    }
}

async function loadMovies() {
    const genre = document.getElementById("genreFilter").value;
    const sortBy = document.getElementById("sortBy").value;
    const order = document.getElementById("sortOrder").value;

    let url = `${API_BASE_URL}/movies?sort_by=${sortBy}&order=${order}&page=${currentPage}`;
    if (genre && genre !== "All") {
        url += `&genre=${encodeURIComponent(genre)}`;
    }

    try {
        const response = await fetch(url);
        const movies = await response.json();
        renderMovies(movies);
        updatePaginationControls(movies.length);
    } catch (error) {
        console.error("Failed to load movies:", error);
    }
}

function renderMovies(movies) {
    const grid = document.getElementById("movieGrid");
    grid.innerHTML = "";

    if (movies.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">No movies found on this page for selected genre.</p>`;
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "bg-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between border border-slate-700/50 hover:border-indigo-500/50 transition duration-300";

        let streamingBadges = movie.streaming_services.map(service => {
            const bgClass = service.available ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed";
            return `<a href="${service.available ? service.url : '#'}" target="${service.available ? '_blank' : '_self'}" 
                       class="text-xs px-2.5 py-1 rounded-md font-medium transition ${bgClass}">
                        ${service.name}
                    </a>`;
        }).join("");

        card.innerHTML = `
            <div>
                <div class="h-80 overflow-hidden bg-slate-900 relative">
                    <img src="${movie.poster_url}" alt="${movie.title}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'">
                    <span class="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-md text-xs px-2.5 py-1 rounded-full font-semibold text-white shadow">${movie.year}</span>
                </div>
                <div class="p-4">
                    <span class="text-xs text-indigo-400 font-semibold uppercase tracking-wider">${movie.genre}</span>
                    <h3 class="text-xl font-bold mt-1 mb-2 text-slate-100 line-clamp-1">${movie.title}</h3>
                    <p class="text-slate-400 text-sm line-clamp-3">${movie.description}</p>
                </div>
            </div>
            <div class="p-4 pt-0">
                <div class="border-t border-slate-700/80 pt-3 mt-2">
                    <p class="text-xs text-slate-400 mb-2 font-medium">Watch on:</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${streamingBadges}
                    </div>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function updatePaginationControls(fetchedCount) {
    let paginationDiv = document.getElementById("paginationControls");
    if (!paginationDiv) {
        paginationDiv = document.createElement("div");
        paginationDiv.id = "paginationControls";
        paginationDiv.className = "flex justify-center items-center gap-4 mt-8 mb-4 col-span-full";
        document.querySelector(".container").appendChild(paginationDiv);
    }

    paginationDiv.innerHTML = `
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled class="bg-slate-700 text-slate-500 cursor-not-allowed px-4 py-2 rounded-lg"' : 'class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"'}>Previous</button>
        <span class="text-slate-300 font-medium">Page ${currentPage}</span>
        <button onclick="changePage(1)" ${fetchedCount === 0 ? 'disabled class="bg-slate-700 text-slate-500 cursor-not-allowed px-4 py-2 rounded-lg"' : 'class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"'}>Next</button>
    `;
}

function changePage(direction) {
    currentPage += direction;
    loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const API_KEY = '88c00e80d532ec774c5bf022e4ad0620';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    fetchMovies(query);
});

async function fetchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
}

function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie', 'p-4', 'bg-gray-800', 'rounded');
        movieElement.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-auto mb-2">
            <h2 class="text-xl font-bold">${movie.title}</h2>
            <p>${movie.overview}</p>
        `;
        moviesContainer.appendChild(movieElement);
    });
}

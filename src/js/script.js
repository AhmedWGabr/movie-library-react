const API_KEY = '88c00e80d532ec774c5bf022e4ad0620'; // Your API key
const BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for the API
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for movie posters

// This line adds an event listener to the search form that listens for the submit event and calls a function to fetch movies.
document.getElementById('search-form').addEventListener('submit', function (event) {
    // This line prevents the default form submission behavior, which would cause the page to reload.
    event.preventDefault();
    // This line gets the value of the input field with the ID query and stores it in the query variable.
    const query = document.getElementById('query').value;
    // This line calls the fetchMovies function with the query string as an argument.
    fetchMovies(query);
});

// This function fetches movies from the API based on the query string and displays them on the page.
async function fetchMovies(query) {
    // This line creates a URL for the API request using the BASE_URL, API_KEY, and query string.
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
    // This line fetches data from the API using the URL and stores it in the response variable.
    const response = await fetch(url);
    // This line parses the JSON data from the response and stores it in the data variable.
    const data = await response.json();
    // This line calls the displayMovies function with the movie data from the API.
    displayMovies(data.results);
}

// The displayMovies function takes an array of movie objects and displays them in a container element with the ID movies.
function displayMovies(movies) {
    // This line retrieves the HTML element with the ID movies and stores it in the moviesContainer variable.
    const moviesContainer = document.getElementById('movies');
    // This line clears any existing content inside the moviesContainer.
    moviesContainer.innerHTML = '';
    // This line loops through each movie object in the movies array and creates a new div element for each movie.
    movies.forEach(movie => {
        // This line creates a new div element with the class movie and adds it to the moviesContainer.
        const movieElement = document.createElement('div');
        // This line sets the innerHTML of the movieElement to display the movie poster, title, and overview.
        movieElement.classList.add('movie', 'p-4', 'bg-gray-800', 'rounded');
        // This Line add movie card.
        movieElement.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-auto mb-2">
            <h2 class="text-xl font-bold">${movie.title}</h2>
            <p>${movie.overview}</p>
        `;
        // This line appends the movieElement to the moviesContainer.
        moviesContainer.appendChild(movieElement);
    });
}

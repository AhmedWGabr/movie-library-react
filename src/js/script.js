const API_KEY = '88c00e80d532ec774c5bf022e4ad0620'; // Your API key
const BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for the API
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for movie posters

// Function to remove sections by their IDs
const removeSections = (sections) => {
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.remove();
    });
};

// Function to add event listener to search forms
const addSearchEventListener = (formId, inputId) => {
    document.getElementById(formId).addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById(inputId).value;
        searchMovies(query);
    });
};

// Add event listeners to both search forms
addSearchEventListener('search-form', 'query');
addSearchEventListener('search-form-sm', 'query-sm');

// Synchronize search input fields
const synchronizeSearchInputs = (inputId1, inputId2) => {
    const input1 = document.getElementById(inputId1);
    const input2 = document.getElementById(inputId2);

    input1.addEventListener('input', () => input2.value = input1.value);
    input2.addEventListener('input', () => input1.value = input2.value);
};

// Synchronize the search input fields
synchronizeSearchInputs('query', 'query-sm');

// Function to fetch movies from the API based on the query string and display them on the page
const searchMovies = async (query) => {
    removeSections(['featured-movies']);
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        displaySearchMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

// Function to display movies in a container element with the ID movies
const displaySearchMovies = (movies) => {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = movies.map(createMovieCard).join('');
};

// Toggle dropdown menu
document.getElementById('menu-button').addEventListener('click', () => {
    const menu = document.getElementById('dropdown-menu');
    menu.classList.toggle('hidden');
});

// Close dropdown menu when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('dropdown-menu');
    if (!event.target.closest('#menu-button') && !event.target.closest('#dropdown-menu')) {
        menu.classList.add('hidden');
    }
});

// Fetch and display featured movies on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFeaturedMovies('box-office', '/movie/now_playing', 'box-office-list');
    fetchAndDisplayFeaturedMovies('all-time', '/movie/top_rated', 'all-time-list');
    fetchAndDisplayFeaturedMovies('popular', '/movie/popular', 'popular-list');
});

// Function to fetch featured movies from the API and display them on the page
const fetchAndDisplayFeaturedMovies = async (section, endpoint, elementId) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        const data = await response.json();
        const movies = data.results.slice(0, 10);
        const container = document.getElementById(elementId);
        container.innerHTML = movies.map(createMovieCard).join('');
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

// Function to create a movie card HTML element
const createMovieCard = (movie) => `
    <div class="relative bg-slate-300 rounded-lg shadow-md overflow-hidden h-96 hover:scale-105 ">
        <div class="absolute inset-0">
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" class="w-full h-full object-cover">
        </div>
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 transition-opacity duration-300 opacity-0 hover:opacity-100">
            <h3 class="text-white text-lg font-semibold text-shadow">${movie.title}</h3>
            <p class="text-white text-shadow">${movie.release_date}</p>
            <p class="text-white text-shadow text-md truncate-overview">${movie.overview}</p>
            <a href="#" class="block mt-4 text-blue-300 font-semibold text-shadow">View details</a>
            <div class="absolute top-4 right-4 bg-${getRatingColor(movie.vote_average)} rounded-full w-12 h-12 flex items-center justify-center">
                <p class="text-white font-semibold">${Math.round(movie.vote_average * 10)}%</p>
            </div>
            <button class="absolute top-4 left-4 bg-slate-400 rounded-full w-8 h-8 flex items-center justify-center wishlist-button" data-movie-id="${movie.id}" onclick="toggleWishlist(this, ${movie.id})">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
            </button>
        </div>
    </div>
`;

const toggleWishlist = (button, movieId) => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.includes(movieId)) {
        wishlist = wishlist.filter(id => id !== movieId);
        button.classList.remove('text-red-500');
    } else {
        wishlist.push(movieId);
        button.classList.add('text-red-500');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

// Initialize wishlist button states
document.addEventListener('DOMContentLoaded', () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.querySelectorAll('.wishlist-button').forEach(button => {
        const movieId = parseInt(button.getAttribute('data-movie-id'), 10);
        if (wishlist.includes(movieId)) {
            button.classList.add('text-red-500');
        }
    });
});


const getRatingColor = (rating) => {
    if (rating >= 7.5) {
        return 'green-500';
    } else if (rating >= 5) {
        return 'yellow-500';
    } else {
        return 'red-500';
    }
};




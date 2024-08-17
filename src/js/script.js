const API_KEY = '88c00e80d532ec774c5bf022e4ad0620'; // Your API key
const BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for the API
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for movie posters
const currentcurrentPage = document.body.getAttribute('data-page');

//****************************************************************************************************************************************************
//                                                               Search Functionality                                                                *
//****************************************************************************************************************************************************

let currentPage = 1;
let resultsPerPage = 5;

// Function to remove sections inside the main element
const removeSections = () => {
    const mainElement = document.querySelector('main');
    const sections = mainElement.querySelectorAll('section');
    sections.forEach(section => {
        section.remove();
    });
};

// Function to add event listener to search forms
const addSearchEventListener = (formId, inputId) => {
    document.getElementById(formId).addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById(inputId).value;
        currentPage = 1; // Reset to first page on new search
        searchMovies(query, currentPage, resultsPerPage);
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
const searchMovies = async (query, page = 1, resultsPerPage = 10) => {
    removeSections();
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&per_page=${resultsPerPage}`);
        const data = await response.json();
        const newSection = createMoviesSection(query, data.total_results, page, resultsPerPage);
        displaySearchMovies(data.results, newSection.querySelector('#movies'), resultsPerPage);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

// Function to create a new section for displaying movies
const createMoviesSection = (query, numResults, page, resultsPerPage) => {
    const mainElement = document.querySelector('main');
    const section = document.createElement('section');
    section.className = 'searched-movies';
    const totalPages = Math.ceil(numResults / resultsPerPage);
    section.innerHTML = `
        <div class="container mx-auto p-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold">Search results for "${query}" (${numResults} results)</h3>
                <div class="flex items-center">
                    <label for="results-per-page" class="mr-2">Results per page:</label>
                    <select id="results-per-page" class="bg-gray-800 border border-gray-300 rounded-md px-2 py-1">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>
            </div>
            <div id="movies" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3"></div>
            <div class="flex justify-center mt-4">
                <button id="prev-page" class="bg-gray-800 text-white px-4 py-2 rounded-md mr-2" ${page === 1 ? 'disabled' : ''}>Previous</button>
                <span id="page-info" class="text-white px-4 py-2">Page ${page} of ${totalPages}</span>
                <button id="next-page" class="bg-gray-800 text-white px-4 py-2 rounded-md" ${page >= totalPages ? 'disabled' : ''}>Next</button>
            </div>
        </div>
    `;
    mainElement.appendChild(section);

    // Set the selected value of the results-per-page dropdown
    section.querySelector('#results-per-page').value = resultsPerPage;

    // Add event listeners for pagination
    section.querySelector('#prev-page').addEventListener('click', () => {
        if (page > 1) {
            currentPage--;
            searchMovies(query, currentPage, resultsPerPage);
        }
    });

    section.querySelector('#next-page').addEventListener('click', () => {
        if (page < totalPages) {
            currentPage++;
            searchMovies(query, currentPage, resultsPerPage);
        }
    });

    // Add event listener for results per page change
    section.querySelector('#results-per-page').addEventListener('change', (event) => {
        resultsPerPage = parseInt(event.target.value);
        currentPage = 1; // Reset to first page on results per page change
        searchMovies(query, currentPage, resultsPerPage);
    });

    return section;
};

// Function to display movies in a container element
const displaySearchMovies = (movies, container, resultsPerPage) => {
    container.innerHTML = movies.slice(0, resultsPerPage).map(createMovieCard).join('');
};


//****************************************************************************************************************************************************
//                                                                 Featured Movies                                                                   *
//****************************************************************************************************************************************************

// Fetch and display featured movies on page load
if (currentcurrentPage === 'home') {
    document.addEventListener('DOMContentLoaded', () => {
        fetchAndDisplayFeaturedMovies('box-office', '/movie/now_playing', 'box-office-list');
        fetchAndDisplayFeaturedMovies('all-time', '/movie/top_rated', 'all-time-list');
        fetchAndDisplayFeaturedMovies('popular', '/movie/popular', 'popular-list');
    });
}

// Function to fetch featured movies from the API and display them on the page
const fetchAndDisplayFeaturedMovies = async (section, endpoint, elementId) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        const data = await response.json();
        const movies = data.results.slice(0, 10);
        const container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = movies.map(createMovieCard).join('');
        } else {
            console.error(`Element with ID ${elementId} not found.`);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

//****************************************************************************************************************************************************
//                                                                Create a Movie Card                                                                *
//****************************************************************************************************************************************************

// Function to create a movie card HTML element
const createMovieCard = (movie) => `
    <div class="relative bg-slate-300 rounded-lg shadow-md overflow-hidden h-96 hover:scale-105">
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

const getRatingColor = (rating) => {
    if (rating >= 7.5) {
        return 'green-500';
    } else if (rating >= 5) {
        return 'yellow-500';
    } else {
        return 'red-500';
    }
};

//****************************************************************************************************************************************************
//                                                                Dropdown menu Functionality                                                        *
//****************************************************************************************************************************************************
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

//****************************************************************************************************************************************************
//                                                                    Wishlist Functionality                                                         *
//****************************************************************************************************************************************************

// Function to toggle movie in the wishlist
const toggleWishlist = (button, movieId) => {
    let wishlist = getWishlist();
    if (wishlist.includes(movieId)) {
        wishlist = wishlist.filter(id => id !== movieId);
        button.classList.remove('text-red-500');
    } else {
        wishlist.push(movieId);
        button.classList.add('text-red-500');
    }
    saveWishlist(wishlist);
};

// Function to get wishlist from localStorage
const getWishlist = () => {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
};

// Function to save wishlist to localStorage
const saveWishlist = (wishlist) => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

// Function to update the state of wishlist buttons on page load
const updateWishlistButtons = () => {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-button').forEach(button => {
        const movieId = parseInt(button.getAttribute('data-movie-id'), 10);
        if (wishlist.includes(movieId)) {
            button.classList.add('text-red-500');
        }
    });
};

// Function to render the wishlist movies on page load
const renderWishlist = () => {
    const wishlist = getWishlist();
    const wishlistContainer = document.getElementById('wishlist-container');

    if (!wishlistContainer) {
        console.error('wishlist-container element not found.');
        return;
    }

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p class="text-gray-500">Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(movieId => {
        fetchMovieDetails(movieId)
            .then(movie => {
                const movieCard = createMovieCard(movie);
                wishlistContainer.innerHTML += movieCard;
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
            });
    });
};

// Function to fetch movie details from the API
const fetchMovieDetails = async (movieId) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
    return await response.json();
};

// Initialize wishlist button states and render wishlist on page load
if (currentcurrentPage === 'wishlist') {
    document.addEventListener('DOMContentLoaded', () => {
        updateWishlistButtons();
        renderWishlist();
    });
}



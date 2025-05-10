const API_KEY = '88c00e80d532ec774c5bf022e4ad0620';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export interface Movie { // Added export
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  vote_count: number; // Added vote_count
  genre_ids?: number[]; // For movie lists
  // Add other movie properties you expect from the API
}

// For lists of movies (popular, search, recommendations)
export interface FetchMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// --- TV Show Interfaces ---
export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  // Add other TV show properties you expect from the API
}

export interface FetchTVShowsResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

// --- Person (Actor) Interfaces ---
export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for_department: string;
  // known_for can be an array of movies or TV shows, might need a more complex type or simplification
}

export interface FetchPeopleResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}


export const fetchPopularMovies = async (page: number = 1): Promise<FetchMoviesResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    // Return a default or empty response structure in case of an error
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

export const fetchTopRatedMovies = async (page: number = 1): Promise<FetchMoviesResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch top rated movies:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

export const fetchNowPlayingMovies = async (page: number = 1): Promise<FetchMoviesResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

// --- TV Show Fetch Functions ---

export const fetchPopularTVShows = async (page: number = 1): Promise<FetchTVShowsResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch popular TV shows:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

export const fetchTopRatedTVShows = async (page: number = 1): Promise<FetchTVShowsResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch top rated TV shows:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

export const discoverTVShows = async (
  page: number = 1,
  sortBy?: string,
  withGenres?: string,
  firstAirDateYear?: number,
  firstAirDateGte?: string,
  firstAirDateLte?: string,
  voteAverageGte?: number,
  voteAverageLte?: number
): Promise<FetchTVShowsResponse> => {
  try {
    let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&include_adult=false&include_null_first_air_dates=false`;

    if (sortBy) {
      url += `&sort_by=${sortBy}`;
    } else {
      url += `&sort_by=popularity.desc`;
    }
    if (withGenres) {
      url += `&with_genres=${withGenres}`;
    }
    if (firstAirDateYear) {
      url += `&first_air_date_year=${firstAirDateYear}`;
    }
    if (firstAirDateGte) {
      url += `&first_air_date.gte=${firstAirDateGte}`;
    }
    if (firstAirDateLte) {
      url += `&first_air_date.lte=${firstAirDateLte}`;
    }
    if (voteAverageGte !== undefined) {
      url += `&vote_average.gte=${voteAverageGte}`;
    }
    if (voteAverageLte !== undefined) {
      url += `&vote_average.lte=${voteAverageLte}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} on ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to discover TV shows:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};


// --- People (Actor) Fetch Functions ---

export const fetchPopularPeople = async (page: number = 1): Promise<FetchPeopleResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch popular people:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};


// You can add more functions here to fetch other data, e.g.:
// export const searchMovies = async (query, page) => { ... };
// export const fetchMovieDetails = async (movieId) => { ... };

export const searchMovies = async (
  query: string,
  page: number = 1,
  year?: number, // For specific year matching if query is also present
  primaryReleaseYear?: number, // Filter by primary release year
  // sortBy?: string, // e.g., popularity.asc, popularity.desc, release_date.asc, etc. // Not supported by /search/movie
  // withGenres?: string, // Comma-separated string of genre IDs // Not supported by /search/movie
  // region?: string // Example of another potential filter
): Promise<FetchMoviesResponse> => {
  try {
    let url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`; // Added include_adult=false by default

    if (year) { // Note: 'year' in search is for matching release year of movies in query
      url += `&year=${year}`;
    }
    if (primaryReleaseYear) { // 'primary_release_year' is a filter
      url += `&primary_release_year=${primaryReleaseYear}`;
    }
    // sortBy and withGenres are not supported by /search/movie endpoint
    // if (sortBy) {
    //   url += `&sort_by=${sortBy}`;
    // }
    // if (withGenres) {
    //   url += `&with_genres=${withGenres}`;
    // }
    // if (region) {
    //   url += `&region=${region}`;
    // }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to search movies:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

export const discoverMovies = async (
  page: number = 1,
  sortBy?: string,
  withGenres?: string, // Comma-separated string of genre IDs
  primaryReleaseYear?: number, // Single year filter
  primaryReleaseDateGte?: string, // YYYY-MM-DD
  primaryReleaseDateLte?: string,  // YYYY-MM-DD
  voteAverageGte?: number,
  voteAverageLte?: number
): Promise<FetchMoviesResponse> => {
  try {
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&page=${page}&include_adult=false&include_video=false`;

    if (sortBy) {
      url += `&sort_by=${sortBy}`;
    } else {
      // Default sort for discover if not specified, TMDB defaults to popularity.desc
      url += `&sort_by=popularity.desc`;
    }
    if (withGenres) {
      url += `&with_genres=${withGenres}`;
    }
    if (primaryReleaseYear) {
      url += `&primary_release_year=${primaryReleaseYear}`;
    }
    if (primaryReleaseDateGte) {
      url += `&primary_release_date.gte=${primaryReleaseDateGte}`;
    }
    if (primaryReleaseDateLte) {
      url += `&primary_release_date.lte=${primaryReleaseDateLte}`;
    }
    if (voteAverageGte !== undefined) {
      url += `&vote_average.gte=${voteAverageGte}`;
    }
    if (voteAverageLte !== undefined) {
      url += `&vote_average.lte=${voteAverageLte}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} on ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to discover movies:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
};

// --- Interfaces for Movie Details ---
// Genre interface is already defined below, ensure it's exported if not already.
// export interface Genre { // Already defined
//   id: number;
//   name: string;
// }

export interface GenresResponse {
  genres: Genre[];
}

// Function to fetch movie genres
export const fetchMovieGenres = async (): Promise<Genre[]> => {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: GenresResponse = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Failed to fetch movie genres:", error);
    return [];
  }
};


export interface Genre { // Ensure this is exported if it wasn't
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string; // e.g., "YouTube"
  size: number;
  type: string; // e.g., "Trailer", "Teaser"
}

export interface VideosResponse {
  results: Video[];
}

export interface ReviewAuthorDetails {
  name: string;
  username: string;
  avatar_path: string | null;
  rating: number | null;
}

export interface Review {
  id: string;
  author: string; // This was 'string', but TMDB returns author_details object. Keeping as string for simplicity if only name is needed.
  author_details: ReviewAuthorDetails; // If full details are needed
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface ReviewsResponse {
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

export interface ReleaseDateInfo {
  certification: string;
  iso_639_1?: string;
  note?: string;
  release_date: string;
  type: number;
}

export interface ReleaseDatesOnCountry {
  iso_3166_1: string;
  release_dates: ReleaseDateInfo[];
}

export interface ReleaseDatesResponse {
  results: ReleaseDatesOnCountry[];
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  videos?: VideosResponse; // Appended response
  credits?: Credits;     // Appended response
  reviews?: ReviewsResponse; // Appended response
  recommendations?: FetchMoviesResponse; // Appended response for similar movies
  release_dates?: ReleaseDatesResponse; // Added for content ratings
}


export interface TVShowDetails extends TVShow {
  genres: Genre[];
  episode_run_time: number[];
  number_of_episodes: number;
  number_of_seasons: number;
  tagline: string | null;
  status: string;
  homepage: string | null;
  // Similar to MovieDetails, add appended responses if needed
  // videos?: VideosResponse;
  // credits?: Credits;
  // reviews?: ReviewsResponse;
  // recommendations?: FetchTVShowsResponse;
}


// --- API Fetching Functions ---

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetails | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,reviews,recommendations,release_dates`
    );
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} for movie ID ${movieId}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch details for movie ID ${movieId}:`, error);
    return null;
  }
};

// Individual fetch functions (can be used if not using append_to_response or for more specific needs)

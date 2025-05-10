'use client';

import { useState, useEffect, FormEvent, ChangeEvent, useCallback, useRef } from 'react'; // Added useRef
import { useRouter, useSearchParams } from 'next/navigation';
import { Movie, searchMovies, discoverMovies, Genre, fetchMovieGenres } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import FilterSidebar, { Filters as FilterOptions } from '@/components/FilterSidebar';

// Debounce function for query input
const debounceQuery = (func: (query: string) => void, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (query: string) => { // Simplified for query only
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(query), waitFor);
  };
  return debounced;
};

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({ sortBy: 'popularity.desc' }); // Default sort
  // const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); // To be removed
  const [showFilterMessage, setShowFilterMessage] = useState(false);

  // Refs to hold the latest values
  const queryRef = useRef(query); // To access latest query in debounced/callback functions
  const activeFiltersRef = useRef(activeFilters); // To access latest filters

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    activeFiltersRef.current = activeFilters;
  }, [activeFilters]);

  const isSearchActive = query.trim() !== '';

  useEffect(() => {
    setShowFilterMessage(isSearchActive);
  }, [isSearchActive]);

  // Fetch genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      const fetchedGenres = await fetchMovieGenres();
      setGenres(fetchedGenres);
    };
    loadGenres();
  }, []);
  
  // Update local state (query, filters, page) from URL search params
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    const sortByFromUrl = searchParams.get('sortBy') || 'popularity.desc';
    const genresFromUrl = searchParams.get('genres')?.split(',') || undefined;
    const gteFromUrl = searchParams.get('gte') || undefined; // Year From (string YYYY)
    const lteFromUrl = searchParams.get('lte') || undefined; // Year To (string YYYY)
    const voteAvgGteFromUrl = searchParams.get('vagte') ? parseFloat(searchParams.get('vagte')!) : undefined;
    const voteAvgLteFromUrl = searchParams.get('valte') ? parseFloat(searchParams.get('valte')!) : undefined;

    setQuery(queryFromUrl);
    setCurrentPage(pageFromUrl);
    
    const initialFiltersFromUrl: FilterOptions = {
      sortBy: sortByFromUrl,
      withGenres: genresFromUrl,
      primaryReleaseDateGte: gteFromUrl,
      primaryReleaseDateLte: lteFromUrl,
      voteAverageGte: voteAvgGteFromUrl,
      voteAverageLte: voteAvgLteFromUrl,
    };
    setActiveFilters(initialFiltersFromUrl);

    // Perform search/discovery if any relevant param exists
    if (queryFromUrl || sortByFromUrl !== 'popularity.desc' || genresFromUrl || gteFromUrl || lteFromUrl || voteAvgGteFromUrl !== undefined || voteAvgLteFromUrl !== undefined) {
      performSearch(queryFromUrl, pageFromUrl, initialFiltersFromUrl);
    } else {
      performSearch("", 1, { sortBy: 'popularity.desc' }); 
      // setSearchResults([]);
    }
  }, [searchParams]); // Removed performSearch from dependencies to avoid re-triggering on its own creation

  const performSearch = useCallback(async (
    searchTerm: string,
    page: number,
    filters: FilterOptions
  ) => {
    setIsLoading(true);
    setError(null);

    const isActuallySearching = searchTerm.trim() !== '';
    const hasActiveFilters =
      filters.sortBy !== 'popularity.desc' ||
      (filters.withGenres && filters.withGenres.length > 0) ||
      filters.primaryReleaseDateGte ||
      filters.primaryReleaseDateLte ||
      filters.voteAverageGte !== undefined ||
      filters.voteAverageLte !== undefined;

    if (!isActuallySearching && !hasActiveFilters && page === 1 && filters.sortBy === 'popularity.desc') {
      // Initial load with default sort
    } else if (!isActuallySearching && !hasActiveFilters) {
      setSearchResults([]);
      setTotalPages(1);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      let data;
      const genreString = filters.withGenres?.join(',');
      const releaseDateGte = filters.primaryReleaseDateGte ? `${filters.primaryReleaseDateGte}-01-01` : undefined;
      const releaseDateLte = filters.primaryReleaseDateLte ? `${filters.primaryReleaseDateLte}-12-31` : undefined;
      
      let primaryReleaseYearForSearch: number | undefined = undefined;
      if (filters.primaryReleaseDateGte && filters.primaryReleaseDateLte && filters.primaryReleaseDateGte === filters.primaryReleaseDateLte) {
        primaryReleaseYearForSearch = parseInt(filters.primaryReleaseDateGte, 10);
      }
      // Note: voteAverageGte/Lte are not supported by /search/movie

      if (isActuallySearching) {
        data = await searchMovies(
          searchTerm,
          page,
          undefined, 
          primaryReleaseYearForSearch
        );
      } else {
        data = await discoverMovies(
          page,
          filters.sortBy,
          genreString,
          undefined, 
          releaseDateGte,
          releaseDateLte,
          filters.voteAverageGte,
          filters.voteAverageLte
        );
      }
      
      setSearchResults(data.results);
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages); 
      setCurrentPage(data.page);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to fetch results. Please try again.');
      setSearchResults([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array for useCallback if it doesn't depend on props/state that change outside its scope
  
  const updateUrlWithFiltersAndQuery = useCallback((newQuery: string, newFilters: FilterOptions, newPage: number = 1) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    }
    // Only add sortBy if it's not the default
    if (newFilters.sortBy && newFilters.sortBy !== 'popularity.desc') {
      params.set('sortBy', newFilters.sortBy);
    }
    if (newFilters.withGenres && newFilters.withGenres.length > 0) {
      params.set('genres', newFilters.withGenres.join(','));
    }
    if (newFilters.primaryReleaseDateGte) {
      params.set('gte', newFilters.primaryReleaseDateGte);
    }
    if (newFilters.primaryReleaseDateLte) {
      params.set('lte', newFilters.primaryReleaseDateLte);
    }
    if (newFilters.voteAverageGte !== undefined) {
      params.set('vagte', String(newFilters.voteAverageGte));
    }
    if (newFilters.voteAverageLte !== undefined) {
      params.set('valte', String(newFilters.voteAverageLte));
    }
    params.set('page', String(newPage));
    
    const newUrl = `/search?${params.toString()}`;

    const hasMeaningfulFilters = (newFilters.sortBy && newFilters.sortBy !== 'popularity.desc') ||
                                (newFilters.withGenres && newFilters.withGenres.length > 0) ||
                                newFilters.primaryReleaseDateGte ||
                                newFilters.primaryReleaseDateLte ||
                                newFilters.voteAverageGte !== undefined ||
                                newFilters.voteAverageLte !== undefined;

    if (newQuery.trim() || hasMeaningfulFilters) {
        router.push(newUrl);
    } else if (newPage > 1) { // if only page changes from 1 with no query/filters
        router.push(newUrl);
    }
     else if (searchParams.toString() !== '' && !hasMeaningfulFilters && !newQuery.trim()) { // Clearing all filters/query
        router.push('/search');
    }


  }, [router, searchParams]);

  const debouncedQueryUpdate = useCallback(debounceQuery((currentQueryParam: string) => {
    updateUrlWithFiltersAndQuery(currentQueryParam, activeFiltersRef.current, 1);
  }, 500), [updateUrlWithFiltersAndQuery]); // Add updateUrlWithFiltersAndQuery to dependencies

  const handleQueryInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQueryValue = event.target.value;
    setQuery(newQueryValue);
    debouncedQueryUpdate(newQueryValue);
  };

  const handleFilterChange = (newFiltersFromSidebar: FilterOptions) => {
    // Ensure sortBy always has a value, defaulting to popularity.desc
    const updatedFilters = {
      ...activeFiltersRef.current,
      ...newFiltersFromSidebar,
      sortBy: newFiltersFromSidebar.sortBy || activeFiltersRef.current.sortBy || 'popularity.desc',
    };
    setActiveFilters(updatedFilters);
    updateUrlWithFiltersAndQuery(queryRef.current, updatedFilters, 1);
  };
  
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Use refs for immediate values on submit
    updateUrlWithFiltersAndQuery(queryRef.current, activeFiltersRef.current, 1);
  };

  const handlePageChange = (newPage: number) => {
    // Use refs for immediate values
    if (newPage >= 1 && newPage <= totalPages && (queryRef.current.trim() || Object.values(activeFiltersRef.current).some(f => f !== undefined && f !== 'popularity.desc' && (!Array.isArray(f) || f.length >0 )))) {
       updateUrlWithFiltersAndQuery(queryRef.current, activeFiltersRef.current, newPage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Explore Movies</h1>
      
      <div className="mb-8 flex justify-center">
        <form onSubmit={handleSearchSubmit} className="flex-grow flex max-w-xl">
          <input
            type="text"
            value={query}
            onChange={handleQueryInputChange}
            placeholder="Search by title (filters apply when empty)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg transition duration-150 text-lg"
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </form>
        {/* Sort dropdown removed from here, handled by FilterSidebar */}
      </div>
      
      {showFilterMessage && (
        <div 
          className="my-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-md text-sm text-center"
          role="alert"
        >
          When searching by title, only year range (if set to a single year) is applied. All other filters (Sort By, Genres, Rating Range) are disabled.
          Clear the search bar to use all filters.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <FilterSidebar 
            genres={genres} 
            initialFilters={activeFilters} 
            onFilterChange={handleFilterChange}
            isSearchActive={isSearchActive} 
          />
        </div>
        
        <div className="w-full md:w-3/4">
          {error && <p className="text-red-500 text-center mb-6 bg-red-100 dark:bg-red-900 dark:text-red-200 p-3 rounded-md">{error}</p>}

          {isLoading && searchResults.length === 0 && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
            </div>
          )}

          {!isLoading && !error && query && searchResults.length === 0 && (
             <p className="text-center text-gray-500 dark:text-gray-400 py-10 text-lg">
              No results found for {'"'}{query}{'"'} with the current filters.
            </p>
          )}
          
          {!isLoading && !error && !query.trim() && Object.values(activeFilters).every(f => f === undefined || (Array.isArray(f) && f.length === 0)) && searchResults.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10 text-lg">
              Please enter a search query or apply filters to find movies.
            </p>
          )}


          {searchResults.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 space-x-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

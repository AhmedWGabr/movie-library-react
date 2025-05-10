// Define a type for the movie items stored in the wishlist
// This should ideally match or be compatible with the Movie type used in your cards
export interface WishlistMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview?: string; 
  // duration_minutes?: number; // duration_minutes is not part of TMDB Movie/MultiSearchResult, consider removing if not used elsewhere
  backdrop_path?: string | null; // Added to match Movie type
  vote_count?: number;         // Added to match Movie type
  media_type: 'movie';        // Added to match MultiSearchResult movie type
  // Add any other properties you want to store or display on the wishlist page
}

const WISHLIST_KEY = 'movieWishlist';

// Type guard to check if an object is a WishlistMovie
function isWishlistMovie(item: unknown): item is WishlistMovie {
  return typeof item === 'object' && item !== null &&
         typeof (item as WishlistMovie).id === 'number' &&
         typeof (item as WishlistMovie).title === 'string' &&
         (typeof (item as WishlistMovie).poster_path === 'string' || (item as WishlistMovie).poster_path === null) &&
         typeof (item as WishlistMovie).release_date === 'string' &&
         typeof (item as WishlistMovie).vote_average === 'number' &&
         ((item as WishlistMovie).media_type === 'movie') && // Check media_type
         (typeof (item as WishlistMovie).backdrop_path === 'string' || (item as WishlistMovie).backdrop_path === null || (item as WishlistMovie).backdrop_path === undefined) && // Check optional backdrop_path
         (typeof (item as WishlistMovie).vote_count === 'number' || (item as WishlistMovie).vote_count === undefined); // Check optional vote_count
}

// Type guard to check if an array is an array of WishlistMovie
function isWishlistMovieArray(items: unknown): items is WishlistMovie[] {
  return Array.isArray(items) && items.every(isWishlistMovie);
}
// Note: The previous SEARCH block for isWishlistMovie was intentionally more concise 
// to allow the REPLACE block to fully define the corrected version with type assertions.
// The isWishlistMovieArray function is corrected above.

export const getWishlist = (): WishlistMovie[] => {
  if (typeof window === 'undefined') {
    return []; // Return empty array during SSR or build time
  }
  try {
    const wishlistJson = localStorage.getItem(WISHLIST_KEY);
    if (wishlistJson) {
      const parsed = JSON.parse(wishlistJson);
      if (isWishlistMovieArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error retrieving wishlist from localStorage:', error);
  }
  return [];
};

export const addToWishlist = (movie: WishlistMovie): void => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    if (!wishlist.find(item => item.id === movie.id)) {
      const updatedWishlist = [...wishlist, movie];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('wishlistUpdated')); // Dispatch event for potential global updates
    }
  } catch (error) {
    console.error('Error adding to wishlist in localStorage:', error);
  }
};

export const removeFromWishlist = (movieId: number): void => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const updatedWishlist = wishlist.filter(item => item.id !== movieId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlistUpdated')); // Dispatch event
  } catch (error) {
    console.error('Error removing from wishlist in localStorage:', error);
  }
};

export const isMovieInWishlist = (movieId: number): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === movieId);
  } catch (error) {
    console.error('Error checking wishlist in localStorage:', error);
    return false;
  }
};

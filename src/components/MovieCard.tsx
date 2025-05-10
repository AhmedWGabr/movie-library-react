'use client'; // Required for hooks

import Image from 'next/image';
import Link from 'next/link';
// import { motion } from 'framer-motion'; // Removed framer-motion
import { IMG_URL, MultiSearchResult, Movie as TmdbMovie, TVShow as TmdbTvShow } from '@/lib/tmdb'; // Import MultiSearchResult and TVShow
import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, isMovieInWishlist, type WishlistMovie } from '@/lib/wishlist';
// import useIntersectionObserver from '../hooks/useIntersectionObserver'; // Removed hook

// SVG Heart Icons
const HeartIconEmpty = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartIconFilled = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// SVG Placeholder for missing images
const ImagePlaceholderIcon = ({ className = "w-full h-full text-gray-300" }: { className?: string }) => ( // Removed dark:text-gray-500
  <div className={`flex items-center justify-center bg-gray-200 ${className}`}> {/* Removed dark:bg-gray-700 */}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 opacity-50">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
</div>
);

// No longer need a separate Movie interface here, will use MultiSearchResult
// interface Movie {
//   id: number;
//   title: string;
//   poster_path: string | null;
//   release_date: string;
//   overview?: string; 
//   vote_average: number;
//   duration_minutes?: number; 
// }

interface MovieCardProps {
  movie: MultiSearchResult; // Changed to MultiSearchResult
  disableInViewAnimation?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie: item, disableInViewAnimation = false }) => { // Renamed movie prop to item
  // const [cardRef, isVisible] = useIntersectionObserver({ once: true, threshold: 0 }); // Removed hook usage
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);

  let actualTitle: string | undefined | null = null;
  if (item) {
    if (item.media_type === 'movie') {
      actualTitle = (item as TmdbMovie).title;
    } else if (item.media_type === 'tv') {
      actualTitle = (item as TmdbTvShow).name;
    }
  }

  const isTitleEffectivelyNA = !actualTitle || actualTitle.trim() === '' || actualTitle.trim().toLowerCase() === 'n/a';
  const isCoreDataMissing = !item || typeof item.id !== 'number' || !item.id || (item.media_type !== 'movie' && item.media_type !== 'tv');
  
  const isItemEffectivelyUnavailable = isCoreDataMissing || isTitleEffectivelyNA;

  const checkWishlistStatus = useCallback(() => {
    setIsInWishlist(isMovieInWishlist(item.id)); // Use item.id
  }, [item.id]);

  useEffect(() => {
    checkWishlistStatus();
    window.addEventListener('wishlistUpdated', checkWishlistStatus);
    return () => {
      window.removeEventListener('wishlistUpdated', checkWishlistStatus);
    };
  }, [checkWishlistStatus]);

  const handleWishlistToggle = (event: React.MouseEvent) => {
    event.preventDefault(); 
    event.stopPropagation(); 

    // Adapt for TV shows if wishlist supports them, or disable for TV shows
    // For now, assuming wishlist is movie-centric or MovieCard only handles movies for wishlist
    if (item.media_type === 'movie') {
      const movieDataForWishlist: WishlistMovie = {
        id: item.id,
        title: (item as TmdbMovie).title, // Type assertion
        poster_path: item.poster_path,
        release_date: (item as TmdbMovie).release_date,
        vote_average: item.vote_average,
      };

      if (isInWishlist) {
        removeFromWishlist(item.id);
      } else {
        addToWishlist(movieDataForWishlist);
      }
      setIsInWishlist(!isInWishlist);
    } else {
      // Optionally handle TV show wishlist logic or show a message
      console.log("Wishlist for TV shows not implemented yet.");
      return; // Or disable button if item.media_type is 'tv'
    }
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Animation duration
  };

  const getRatingStyle = (rating: number): React.CSSProperties => {
    let r = 0, g = 0; 
    const b = 0; // b is always 0 in this logic
    if (rating <= 0) return { backgroundColor: 'rgb(107, 114, 128)', color: 'white' };
    const normalizedRating = Math.max(0, Math.min(10, rating));
    if (normalizedRating < 5) {
      const t = normalizedRating / 5;
      r = 255; g = Math.round(t * 255);
    } else {
      const t = (normalizedRating - 5) / 5;
      r = Math.round(255 * (1 - t)); g = 255;
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textColor = luminance > 0.6 ? 'black' : 'white';
    return { backgroundColor: `rgb(${r},${g},${b})`, color: textColor };
  };

  // Removed extra closing brace that was here

  if (isItemEffectivelyUnavailable) {
    return (
      <div
        // ref={cardRef} // Removed ref
        className={`group bg-gray-800 rounded-lg shadow-lg overflow-hidden relative opacity-60 cursor-not-allowed ${!disableInViewAnimation ? 'card-unavailable-appear' : ''}`}
        onClick={() => setShowUnavailableMessage(!showUnavailableMessage)}
        title={
          item 
            ? (item.media_type === 'movie' ? (item as TmdbMovie).title : item.media_type === 'tv' ? (item as TmdbTvShow).name : "Item data incomplete") 
            : "Item unavailable"
        }
      >
        {/* Simplified content for unavailable card */}
        <div className="relative w-full h-60 md:h-72 bg-gray-700 flex items-center justify-center">
          {item?.poster_path ? (
            <Image
              src={`${IMG_URL}${item.poster_path}`}
              alt={actualTitle || "Poster"}
              fill
              className="rounded-lg object-cover opacity-50" // Dim image
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <ImagePlaceholderIcon className="w-full h-full rounded-lg opacity-50" />
          )}
          {/* General "Unavailable" overlay */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-sm text-center bg-black bg-opacity-60 px-3 py-1 rounded">Unavailable</p>
          </div>
          {/* Detailed message on click */}
          {showUnavailableMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4 z-10">
              <p className="text-white text-center text-sm">
                This item is currently unavailable or has incomplete data.
              </p>
            </div>
          )}
        </div>
        <div className="p-3 text-left">
            <h3 className="text-lg font-semibold text-gray-400 truncate mb-1" title={actualTitle || "Title unavailable"}>
              {actualTitle || "Title unavailable"}
            </h3>
            <p className="text-xs text-gray-500">Details not available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      // ref={cardRef} // Removed ref
      className={`group movie-card bg-gray-800 rounded-lg shadow-lg overflow-hidden relative ${!disableInViewAnimation ? 'card-appear' : ''} ${disableInViewAnimation ? '' : ''}`} // Ensure base opacity is not overridden if animation disabled
    >
      <Link href={item.media_type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`} className="block">
        <div className="relative w-full h-60 md:h-72 bg-gray-700">
          {item.poster_path ? (
            <Image
              src={`${IMG_URL}${item.poster_path}`}
              alt={item.media_type === 'movie' ? (item as TmdbMovie).title : (item as TmdbTvShow).name}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <ImagePlaceholderIcon className="w-full h-full rounded-lg" />
          )}
          <div
            className="absolute top-2 right-2 text-sm font-bold px-2 py-1 rounded-md shadow"
            style={getRatingStyle(item.vote_average)}
          >
            {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
          </div>

          {/* Wishlist Icon - Conditionally render or disable for TV shows if not supported */}
          {item.media_type === 'movie' && (
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-2 left-2 p-1.5 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-ping-once' : ''}`}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              style={{ transform: isAnimating ? 'scale(1.3)' : 'scale(1)' }}
            >
              {isInWishlist ? <HeartIconFilled className="w-5 h-5 text-red-500" /> : <HeartIconEmpty className="w-5 h-5" />}
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out text-left">
            <h3 className="text-lg font-semibold text-white truncate mb-1" title={item.media_type === 'movie' ? (item as TmdbMovie).title : (item as TmdbTvShow).name}>
              {item.media_type === 'movie' ? (item as TmdbMovie).title : (item as TmdbTvShow).name}
            </h3>
            <div className="text-xs text-gray-300 mb-1">
              <span>
                {item.media_type === 'movie' 
                  ? ((item as TmdbMovie).release_date ? new Date((item as TmdbMovie).release_date).toLocaleDateString() : 'N/A')
                  : ((item as TmdbTvShow).first_air_date ? new Date((item as TmdbTvShow).first_air_date).toLocaleDateString() : 'N/A')}
              </span>
              {/* Duration is typically available in movie details, not in list items */}
            </div>
            <p className="text-xs text-gray-200 max-h-20 overflow-y-auto">
              {item.overview || 'No overview available.'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;

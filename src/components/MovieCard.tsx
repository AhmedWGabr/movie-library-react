'use client'; // Required for hooks

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IMG_URL } from '@/lib/tmdb';
import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, isMovieInWishlist, type WishlistMovie } from '@/lib/wishlist';

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

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview?: string; // Made optional to match WishlistMovie
  vote_average: number;
  duration_minutes?: number; // Already optional
}

interface MovieCardProps {
  movie: Movie;
  disableInViewAnimation?: boolean; // New prop
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, disableInViewAnimation = false }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const checkWishlistStatus = useCallback(() => {
    setIsInWishlist(isMovieInWishlist(movie.id));
  }, [movie.id]);

  useEffect(() => {
    checkWishlistStatus();
    // Listen for custom event to re-check status if wishlist is updated elsewhere
    window.addEventListener('wishlistUpdated', checkWishlistStatus);
    return () => {
      window.removeEventListener('wishlistUpdated', checkWishlistStatus);
    };
  }, [checkWishlistStatus]);

  const handleWishlistToggle = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent link navigation if icon is inside a Link
    event.stopPropagation(); // Prevent event bubbling

    const movieDataForWishlist: WishlistMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    };

    if (isInWishlist) {
      removeFromWishlist(movie.id);
    } else {
      addToWishlist(movieDataForWishlist);
    }
    setIsInWishlist(!isInWishlist);
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

  return (
    <motion.div
      className="group bg-gray-800 rounded-lg shadow-lg overflow-hidden relative" // Reverted to original
      initial={!disableInViewAnimation ? { opacity: 0, y: 20 } : undefined}
      whileInView={!disableInViewAnimation ? { opacity: 1, y: 0 } : undefined}
      viewport={!disableInViewAnimation ? { once: true, amount: 0.1 } : undefined}
      transition={!disableInViewAnimation ? { duration: 0.3, ease: "easeOut" } : undefined}
      whileHover={{ scale: 1.03 }} // Removed boxShadow, slightly reduced scale for subtlety
      // Note: The whileHover transition will use its own default or the one specified here if different
    >
      <Link href={`/movie/${movie.id}`} className="block">
        {/* Adjusted height for 2:3 aspect ratio based on w-40 (160px -> h-60 is 240px) and md:w-48 (192px -> h-72 is 288px) */}
        <div className="relative w-full h-60 md:h-72 bg-gray-700"> {/* Changed h-96 */}
          {movie.poster_path ? (
            <Image
              src={`${IMG_URL}${movie.poster_path}`}
              alt={movie.title}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Basic responsive sizes
              priority={false} // Consider setting priority for above-the-fold images if applicable elsewhere
            />
          ) : (
            <ImagePlaceholderIcon className="w-full h-full rounded-lg" />
          )}
          <div
            className="absolute top-2 right-2 text-sm font-bold px-2 py-1 rounded-md shadow"
            style={getRatingStyle(movie.vote_average)}
          >
            {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 left-2 p-1.5 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-ping-once' : ''}`} // Reverted to original
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            style={{ transform: isAnimating ? 'scale(1.3)' : 'scale(1)' }}
          >
            {isInWishlist ? <HeartIconFilled className="w-5 h-5 text-red-500" /> : <HeartIconEmpty className="w-5 h-5" />}
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out text-left"> {/* Reverted to original */}
            <h3 className="text-lg font-semibold text-white truncate mb-1" title={movie.title}> {/* Reverted to original */}
              {movie.title}
            </h3>
            <div className="text-xs text-gray-300 mb-1"> {/* Reverted to original */}
              <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
              {movie.duration_minutes && movie.duration_minutes > 0 && (
                <span className="ml-2">| {movie.duration_minutes} min</span>
              )}
            </div>
            <p className="text-xs text-gray-200 max-h-20 overflow-y-auto"> {/* Reverted to original */}
              {movie.overview || 'No overview available.'}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;

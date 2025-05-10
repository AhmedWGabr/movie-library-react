'use client'; // Required for hooks

import Image from 'next/image';
import Link from 'next/link';
// import { motion } from 'framer-motion'; // Removed framer-motion
import { IMG_URL } from '@/lib/tmdb';
import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, isMovieInWishlist, type WishlistMovie } from '@/lib/wishlist';

// SVG Heart Icons (can be moved to a shared file if used in more places)
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

interface Movie { // Assuming this interface is consistent
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview?: string; // Made optional
  vote_average: number;
  duration_minutes?: number; // Already optional
}

interface RecommendationCardProps {
  movie: Movie;
  disableInViewAnimation?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ movie, disableInViewAnimation = false }) => {
  const posterUrl = movie.poster_path ? `${IMG_URL}${movie.poster_path}` : '/placeholder-image.png';
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const checkWishlistStatus = useCallback(() => {
    setIsInWishlist(isMovieInWishlist(movie.id));
  }, [movie.id]);

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
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getRatingStyle = (rating: number): React.CSSProperties => {
    let r = 0, g = 0;
    const b = 0; // b is always 0
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
    <div 
      className={`group movie-card bg-gray-800 rounded-lg shadow-lg overflow-hidden relative ${!disableInViewAnimation ? 'card-appear' : ''}`}
    >
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative w-full h-72"> {/* Retained h-72 for smaller card */}
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="rounded-lg object-cover"
          />
          <div
            className="absolute top-2 right-2 text-sm font-bold px-2 py-1 rounded-md shadow"
            style={getRatingStyle(movie.vote_average)}
          >
            {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 left-2 p-1.5 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-ping-once' : ''}`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            style={{ transform: isAnimating ? 'scale(1.3)' : 'scale(1)' }}
          >
            {isInWishlist ? <HeartIconFilled className="w-5 h-5 text-red-500" /> : <HeartIconEmpty className="w-5 h-5" />}
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out text-left">
            <h3 className="text-lg font-semibold text-white truncate mb-1" title={movie.title}>
              {movie.title}
            </h3>
            <div className="text-xs text-gray-300 mb-1">
              <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
              {movie.duration_minutes && movie.duration_minutes > 0 && (
                <span className="ml-2">| {movie.duration_minutes} min</span>
              )}
            </div>
            <p className="text-xs text-gray-200 max-h-20 overflow-y-auto">
              {movie.overview || 'No overview available.'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecommendationCard;

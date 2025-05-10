'use client';

import { useState, useEffect, useCallback } from 'react';
import MovieCard from '@/components/MovieCard'; // Using MovieCard for consistent larger display on this page
import { getWishlist, type WishlistMovie } from '@/lib/wishlist';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlistMovies, setWishlistMovies] = useState<WishlistMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlist = useCallback(() => {
    setWishlistMovies(getWishlist());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWishlist();
    // Listen for custom event to re-load wishlist if it's updated elsewhere (e.g., by another tab or component)
    window.addEventListener('wishlistUpdated', loadWishlist);
    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist);
    };
  }, [loadWishlist]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-white">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">
      <div className="flex items-center mb-8">
        <span className="w-1 h-8 bg-yellow-400 mr-4"></span>
        <h1 className="text-4xl md:text-5xl font-bold font-bebas-neue">My Wishlist</h1>
      </div>

      {wishlistMovies.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <p className="text-xl mb-4">Your wishlist is currently empty.</p>
          <p>Start adding movies you want to watch!</p>
          <Link href="/" legacyBehavior>
            <a className="mt-6 inline-block bg-yellow-500 text-black font-semibold py-2 px-6 rounded-md hover:bg-yellow-600 transition-colors">
              Browse Movies
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlistMovies.map(wishlistEntry => {
            // Adapt WishlistMovie to the MultiSearchResult type expected by MovieCard
            const movieForCard = {
              ...wishlistEntry, // Spread existing properties
              // Ensure required fields for the 'Movie' part of MultiSearchResult are present
              backdrop_path: wishlistEntry.backdrop_path ?? null,
              vote_count: wishlistEntry.vote_count ?? 0,
              overview: wishlistEntry.overview || '', // Ensure overview is a string
              // genre_ids is optional in Movie type, so not strictly needed unless MovieCard depends on it
              // media_type is already 'movie' in WishlistMovie type
            };
            return <MovieCard key={movieForCard.id} movie={movieForCard} />;
          })}
        </div>
      )}
    </div>
  );
}

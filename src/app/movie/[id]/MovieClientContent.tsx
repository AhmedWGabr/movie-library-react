"use client"; // Required for useState, useEffect, and event handlers

import { IMG_URL_ORIGINAL, IMG_URL } from '@/lib/tmdb';
import type { MovieDetails, CastMember, Review, Video, Movie, ReleaseDatesOnCountry } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import RecommendationCard from '@/components/RecommendationCard';
import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, isMovieInWishlist, type WishlistMovie } from '@/lib/wishlist';

interface MovieClientContentProps {
  initialMovie: MovieDetails; // Movie data passed from server component
  movieId: number;
}

// Helper functions (can be moved to a utils file if used elsewhere)
const formatRuntime = (minutes: number | null): string => {
  if (minutes === null || minutes === 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || 'N/A';
};

const getUSCertification = (releaseDates?: ReleaseDatesOnCountry[]): string | null => {
  if (!releaseDates) return null;
  const usRelease = releaseDates.find(r => r.iso_3166_1 === 'US');
  if (usRelease && usRelease.release_dates.length > 0) {
    const theatricalRelease = usRelease.release_dates.find(rd => rd.type === 3 && rd.certification);
    if (theatricalRelease) return theatricalRelease.certification;
    const firstCertification = usRelease.release_dates.find(rd => rd.certification);
    return firstCertification ? firstCertification.certification : null;
  }
  return null;
};

const formatReviewDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (_e) {
    console.error("Error formatting date:", _e);
    return dateString;
  }
};

export default function MovieClientContent({ initialMovie, movieId: receivedMovieId }: MovieClientContentProps) {
  const [movie, setMovie] = useState<MovieDetails>(initialMovie);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Use initialMovie directly if it's guaranteed to be fresh,
  // or re-fetch/update if necessary (though for this structure, initialMovie should be sufficient)
  useEffect(() => {
    setMovie(initialMovie);
  }, [initialMovie]);


  const updateWishlistStatus = useCallback(() => {
    // Ensure movie object is available before checking wishlist
    if (movie && typeof movie.id === 'number') {
      setIsInWishlist(isMovieInWishlist(movie.id));
    } else if (typeof receivedMovieId === 'number') { // Fallback to movieId from props if movie state isn't ready
        setIsInWishlist(isMovieInWishlist(receivedMovieId));
    }
  }, [movie, receivedMovieId]);

  useEffect(() => {
    updateWishlistStatus(); // Initial check

    window.addEventListener('wishlistUpdated', updateWishlistStatus);
    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistStatus);
    };
  }, [updateWishlistStatus]);

  if (!movie) {
    // This should ideally not happen if initialMovie is always provided
    return <div className="container mx-auto p-4 text-center">Loading movie data...</div>;
  }

  const mainTrailer = movie.videos?.results.find(
    (video: Video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
  );
  const usCertification = getUSCertification(movie.release_dates?.results);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtimeFormatted = formatRuntime(movie.runtime);
  const director = movie.credits?.crew.find(member => member.job === 'Director');
  const writers = movie.credits?.crew.filter(member => member.department === 'Writing').slice(0, 3);
  const stars = movie.credits?.cast.slice(0, 3);

  const handleToggleWishlist = () => {
    if (!movie) return;

    const movieItem: WishlistMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
    };

    if (isInWishlist) {
      removeFromWishlist(movie.id);
    } else {
      addToWishlist(movieItem);
    }
    setIsInWishlist(!isInWishlist);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="lg:w-3/4 space-y-12">
          <section className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <span>{releaseYear}</span>
              {usCertification && (
                <>
                  <span>&bull;</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs">{usCertification}</span>
                </>
              )}
              {runtimeFormatted !== 'N/A' && (
                <>
                  <span>&bull;</span>
                  <span>{runtimeFormatted}</span>
                </>
              )}
            </div>
            {movie.tagline && <p className="text-lg text-gray-500 italic mt-2">{`"${movie.tagline}"`}</p>}
          </section>

          <section className="mb-8 flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
              {movie.poster_path ? (
                <Image
                  src={`${IMG_URL_ORIGINAL}${movie.poster_path}`}
                  alt={movie.title}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-xl object-cover w-full"
                  priority
                />
              ) : (
                <div className="w-full h-[450px] bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                  No Poster
                </div>
              )}
            </div>

            <div className="w-full md:flex-grow min-w-0">
              {mainTrailer ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${mainTrailer.key}`}
                    title={mainTrailer.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                  <p>No trailer available.</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 space-y-4">
              <Link href="#photos-videos" className="block bg-gray-800 p-3 rounded-lg text-center hover:bg-gray-700 transition-colors">
                <div className="text-2xl font-semibold">{movie.videos?.results?.filter(v => v.site === 'YouTube').length || 0}</div>
                <div className="text-sm text-gray-400">VIDEOS</div>
              </Link>
              <Link href="#photos-videos" className="block bg-gray-800 p-3 rounded-lg text-center hover:bg-gray-700 transition-colors">
                <div className="text-2xl font-semibold">{movie.images?.backdrops?.length || 0}</div>
                <div className="text-sm text-gray-400">PHOTOS</div>
              </Link>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">IMDb RATING</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-2xl mr-1">&#9733;</span>
                  <span className="text-2xl font-bold">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="text-gray-400 text-sm ml-1">/ 10</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{movie.vote_count.toLocaleString()} votes</div>
              </div>
              <button
                onClick={handleToggleWishlist}
                className={`w-full font-semibold py-2.5 rounded-md transition-colors ${
                  isInWishlist
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {isInWishlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </section>

          <section className="mb-8">
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <Link key={genre.id} href={`/search?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}`} className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-full text-sm transition-colors">
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{movie.overview || 'No overview available.'}</p>
            </div>
            <div className="space-y-3 text-sm">
              {director && (
                <div>
                  <span className="font-semibold">Director: </span>
                  <Link href={`/person/${director.id}`} className="text-blue-400 hover:underline">{director.name}</Link>
                </div>
              )}
              {writers && writers.length > 0 && (
                <div>
                  <span className="font-semibold">Writers: </span>
                  {writers.map((writer, index) => (
                    <span key={writer.id}>
                      <Link href={`/person/${writer.id}`} className="text-blue-400 hover:underline">{writer.name}</Link>
                      {index < writers.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
              {stars && stars.length > 0 && (
                <div>
                  <span className="font-semibold">Stars: </span>
                  {stars.map((star, index) => (
                    <span key={star.id}>
                      <Link href={`/person/${star.id}`} className="text-blue-400 hover:underline">{star.name}</Link>
                      {index < stars.length - 1 && ', '}
                    </span>
                  ))}
                  {movie.credits && movie.credits.cast.length > 3 && <span className="text-gray-400"> | </span>}
                  {movie.credits && movie.credits.cast.length > 3 && <Link href="#cast" className="text-blue-400 hover:underline">See full cast & crew</Link>}
                </div>
              )}
            </div>
          </section>

          <section id="photos-videos" className="my-12 scroll-mt-20">
            <div className="flex items-center mb-6">
              <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
              <h2 className="text-3xl font-bold font-bebas-neue">Photos & Videos</h2>
            </div>
            {(movie.images?.backdrops && movie.images.backdrops.length > 0) || (movie.videos?.results && movie.videos.results.filter(v => v.site === 'YouTube').length > 0) ? (
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {movie.images?.backdrops?.slice(0, 10).map((image: import('@/lib/tmdb').ImageFile) => (
                  <div key={image.file_path} className="flex-shrink-0 w-80 h-45 relative rounded-lg overflow-hidden shadow-lg bg-gray-800">
                    <Image
                      src={`${IMG_URL_ORIGINAL}${image.file_path}`}
                      alt="Movie backdrop"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                ))}
                {movie.videos?.results?.filter(v => v.site === 'YouTube').slice(0, 5).map((video) => (
                  <div key={video.key} className="flex-shrink-0 w-80 h-45 relative rounded-lg overflow-hidden bg-black group shadow-lg">
                    <Image
                      src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                      alt={video.name || 'Video thumbnail'}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <a
                      href={`https://www.youtube.com/watch?v=${video.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label={`Watch video: ${video.name || 'YouTube video'}`}
                    >
                      <svg className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8 bg-gray-800 rounded-lg">
                <p>No photos or videos available for this movie.</p>
              </div>
            )}
          </section>

          {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
            <section id="cast" className="my-12">
              <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Top cast</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {movie.credits.cast.slice(0, 12).map((actor: CastMember) => (
                  <div key={actor.id} className="flex items-center space-x-4">
                    <Link href={`/person/${actor.id}`} className="flex-shrink-0" passHref>
                      {actor.profile_path ? (
                        <Image
                          src={`${IMG_URL}${actor.profile_path}`}
                          alt={actor.name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover w-16 h-16"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs">
                          No Pic
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/person/${actor.id}`} className="text-white hover:underline" passHref>
                        <p className="font-semibold text-md truncate" title={actor.name}>{actor.name}</p>
                      </Link>
                      <p className="text-sm text-gray-400 truncate" title={actor.character}>{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="my-12">
            <div className="flex items-center mb-6">
              <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
              <h2 className="text-3xl font-bold font-bebas-neue">Reviews</h2>
            </div>
            {movie.reviews && movie.reviews.results && movie.reviews.results.length > 0 ? (
              <div className="space-y-4">
                {movie.reviews.results.map((review: Review) => (
                  <div key={review.id} className="py-4 border-b border-gray-700 last:border-b-0">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {review.author_details.avatar_path ? (
                          <Image
                            src={review.author_details.avatar_path.startsWith('/http') ? review.author_details.avatar_path.substring(1) : `${IMG_URL}${review.author_details.avatar_path}`}
                            alt={review.author}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {review.author.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="bg-gray-700 rounded-xl p-3 shadow">
                          <div className="flex items-baseline justify-between">
                            <h3 className="font-semibold text-sm text-white">
                              {review.author}
                            </h3>
                            {review.author_details.rating && (
                              <span className="text-xs bg-gray-600 text-yellow-400 font-bold px-1.5 py-0.5 rounded-sm">
                                {review.author_details.rating}/10
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">
                            {review.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1.5 pl-1">
                          <span>{formatReviewDate(review.created_at)}</span>
                          <Link href={review.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View on TMDB
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8 bg-gray-800 rounded-lg">
                <p>No reviews available for this movie yet.</p>
              </div>
            )}
          </section>
        </div>

        <div className="w-full lg:w-1/4 lg:sticky lg:top-24 lg:self-start">
          {movie.recommendations && movie.recommendations.results && movie.recommendations.results.length > 0 && (
            <section className="my-12 lg:my-0">
              <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {movie.recommendations.results.slice(0,10).map((recMovie: Movie) => (
                  <RecommendationCard key={recMovie.id} movie={recMovie} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

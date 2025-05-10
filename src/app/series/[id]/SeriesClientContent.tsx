"use client";

import { IMG_URL_ORIGINAL, IMG_URL } from '@/lib/tmdb';
import type { TVShowDetails, CastMember, Review, Video, TVShow, ContentRating } from '@/lib/tmdb'; // Ensure TVShow is imported if needed for recommendations
import Image from 'next/image';
import Link from 'next/link';
import RecommendationCard from '@/components/RecommendationCard'; // This expects a Movie prop, might need adjustment or a SeriesRecommendationCard
import { useState, useEffect } from 'react';
// import { addToWishlist, removeFromWishlist, isMovieInWishlist, type WishlistMovie } from '@/lib/wishlist'; // Wishlist for series might need separate logic

interface SeriesClientContentProps {
  initialSeries: TVShowDetails;
  seriesId: number;
}

const formatRuntime = (runtimeArray: number[] | null | undefined): string => {
  if (!runtimeArray || runtimeArray.length === 0) return 'N/A';
  // Assuming the first runtime is representative, or average them
  const minutes = runtimeArray[0];
  if (minutes === null || minutes === 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || 'N/A';
};

const getUSCertificationTV = (contentRatings?: ContentRating[]): string | null => {
  if (!contentRatings) return null;
  const usRating = contentRatings.find(r => r.iso_3166_1 === 'US');
  return usRating ? usRating.rating : null;
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


export default function SeriesClientContent({ initialSeries }: SeriesClientContentProps) {
  const [series, setSeries] = useState<TVShowDetails>(initialSeries);
  // const [isInWishlist, setIsInWishlist] = useState(false); // Wishlist logic for series TBD

  useEffect(() => {
    setSeries(initialSeries);
  }, [initialSeries]);

  if (!series) {
    return <div className="container mx-auto p-4 text-center">Loading series data...</div>;
  }

  const mainTrailer = series.videos?.results.find(
    (video: Video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
  );
  const usCertification = getUSCertificationTV(series.content_ratings?.results);
  const firstAirYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A';
  const runtimeFormatted = formatRuntime(series.episode_run_time);
  
  // Extract "Created by" from aggregate_credits.crew if available
  const creators = series.aggregate_credits?.crew?.filter(member => member.job === 'Creator' || member.department === 'Writing' && (member.job === 'Writer' || member.job === 'Screenplay')) || [];
  const uniqueCreators = Array.from(new Set(creators.map(c => c.id)))
    .map(id => creators.find(c => c.id === id))
    .filter(Boolean) as import('@/lib/tmdb').CrewMember[]; // Correctly type as CrewMember or a specific subset
  
  const stars = series.aggregate_credits?.cast?.slice(0, 3);

  // Wishlist for series TBD
  // const handleToggleWishlist = () => { ... };

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="lg:w-3/4 space-y-12">
          <section className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{series.name}</h1>
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <span>{firstAirYear}</span>
              {usCertification && (
                <>
                  <span>&bull;</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs">{usCertification}</span>
                </>
              )}
              {runtimeFormatted !== 'N/A' && (
                <>
                  <span>&bull;</span>
                  <span>{runtimeFormatted} / episode</span>
                </>
              )}
               {series.number_of_seasons && (
                <>
                  <span>&bull;</span>
                  <span>{series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
            {series.tagline && <p className="text-lg text-gray-500 italic mt-2">{`"${series.tagline}"`}</p>}
          </section>

          <section className="mb-8 flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
              {series.poster_path ? (
                <Image
                  src={`${IMG_URL_ORIGINAL}${series.poster_path}`}
                  alt={series.name}
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
                <div className="text-2xl font-semibold">{series.videos?.results?.filter(v => v.site === 'YouTube').length || 0}</div>
                <div className="text-sm text-gray-400">VIDEOS</div>
              </Link>
              {/* Photos for series might need a different approach or might not be available in the same way as movies */}
              {/* <Link href="#photos-videos" className="block bg-gray-800 p-3 rounded-lg text-center hover:bg-gray-700 transition-colors">
                <div className="text-2xl font-semibold">{series.images?.backdrops?.length || 0}</div>
                <div className="text-sm text-gray-400">PHOTOS</div>
              </Link> */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">TMDB RATING</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-2xl mr-1">&#9733;</span>
                  <span className="text-2xl font-bold">{series.vote_average ? series.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="text-gray-400 text-sm ml-1">/ 10</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{series.vote_count.toLocaleString()} votes</div>
              </div>
              {/* Wishlist button TBD for series */}
            </div>
          </section>

          <section className="mb-8">
            {series.genres && series.genres.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {series.genres.map(genre => (
                    <Link key={genre.id} href={`/search?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}&type=tv`} className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-full text-sm transition-colors">
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{series.overview || 'No overview available.'}</p>
            </div>
            <div className="space-y-3 text-sm">
              {uniqueCreators && uniqueCreators.length > 0 && (
                <div>
                  <span className="font-semibold">Creators: </span>
                  {uniqueCreators.map((creator, index) => (
                    <span key={creator.id}>
                      <Link href={`/person/${creator.id}`} className="text-blue-400 hover:underline">{creator.name}</Link>
                      {index < uniqueCreators.length - 1 && ', '}
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
                  {series.aggregate_credits && series.aggregate_credits.cast && series.aggregate_credits.cast.length > 3 && <span className="text-gray-400"> | </span>}
                  {series.aggregate_credits && series.aggregate_credits.cast && series.aggregate_credits.cast.length > 3 && <Link href="#cast" className="text-blue-400 hover:underline">See full cast & crew</Link>}
                </div>
              )}
            </div>
          </section>
          
          {/* Photos & Videos Section - Simplified for Series */}
          <section id="photos-videos" className="my-12 scroll-mt-20">
             <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Videos</h2>
            </div>
            {series.videos?.results && series.videos.results.filter(v => v.site === 'YouTube').length > 0 ? (
                 <div className="flex overflow-x-auto space-x-4 pb-4">
                    {series.videos.results.filter(v => v.site === 'YouTube').slice(0,10).map((video) => (
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
                                <svg className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-8 bg-gray-800 rounded-lg">
                    <p>No videos available for this series.</p>
                </div>
            )}
          </section>


          {series.aggregate_credits?.cast && series.aggregate_credits.cast.length > 0 && (
            <section id="cast" className="my-12">
              <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Top cast</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {series.aggregate_credits.cast.slice(0, 12).map((actor: CastMember) => (
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
            {series.reviews?.results && series.reviews.results.length > 0 ? (
                <div className="space-y-4">
                    {series.reviews.results.map((review: Review) => (
                        <div key={review.id} className="py-4 border-b border-gray-700 last:border-b-0">
                           {/* Review rendering logic similar to MovieClientContent */}
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
                    <p>No reviews available for this series yet.</p>
                </div>
            )}
          </section>

        </div>

        <div className="w-full lg:w-1/4 lg:sticky lg:top-24 lg:self-start">
          {series.recommendations?.results && series.recommendations.results.length > 0 && (
            <section className="my-12 lg:my-0">
              <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {series.recommendations.results.slice(0,10).map((recSeries: TVShow) => {
                  // Adapt TVShow to fit RecommendationCard's expected Movie prop structure
                  const movieForRecCard = {
                    id: recSeries.id,
                    title: recSeries.name,
                    poster_path: recSeries.poster_path,
                    release_date: recSeries.first_air_date,
                    overview: recSeries.overview,
                    vote_average: recSeries.vote_average,
                    // duration_minutes is optional in RecommendationCard's Movie type
                  };
                  return <RecommendationCard key={recSeries.id} movie={movieForRecCard} />;
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

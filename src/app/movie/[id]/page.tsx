import { fetchMovieDetails, IMG_URL_ORIGINAL, IMG_URL } from '@/lib/tmdb';
import type { MovieDetails, CastMember, Review, Video, Movie, ReleaseDatesOnCountry } from '@/lib/tmdb'; // Removed ReleaseDateInfo
import Image from 'next/image';
import Link from 'next/link';
// import MovieCard from '@/components/MovieCard'; // Keep for other uses if any, or remove if only recommendations use cards
import RecommendationCard from '@/components/RecommendationCard'; // Import the new card

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

const formatRuntime = (minutes: number | null): string => {
  if (minutes === null || minutes === 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || 'N/A';
};

// Helper to get US certification
const getUSCertification = (releaseDates?: ReleaseDatesOnCountry[]): string | null => {
  if (!releaseDates) return null;
  const usRelease = releaseDates.find(r => r.iso_3166_1 === 'US');
  if (usRelease && usRelease.release_dates.length > 0) {
    // Find a theatrical release (type 3) or any non-empty certification
    const theatricalRelease = usRelease.release_dates.find(rd => rd.type === 3 && rd.certification);
    if (theatricalRelease) return theatricalRelease.certification;
    // Fallback to the first available certification for the US
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
    console.error("Error formatting date:", _e); // "Use" _e by logging it
    return dateString; // Fallback to original string if parsing fails
  }
};

export default async function MovieDetailPage({ params: paramsProp }: MovieDetailPageProps) {
  // Next.js error suggests awaiting params.
  const params = await paramsProp;
  const movieId = parseInt(params.id, 10);
  if (isNaN(movieId)) {
    return <div className="container mx-auto p-4 text-center text-red-500">Invalid Movie ID.</div>;
  }

  const movie: MovieDetails | null = await fetchMovieDetails(movieId);

  if (!movie) {
    return <div className="container mx-auto p-4 text-center">Movie not found or error fetching details.</div>;
  }

  const mainTrailer = movie.videos?.results.find(
    (video: Video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
  );

  const usCertification = getUSCertification(movie.release_dates?.results);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtimeFormatted = formatRuntime(movie.runtime);

  const director = movie.credits?.crew.find(member => member.job === 'Director');
  const writers = movie.credits?.crew.filter(member => member.department === 'Writing').slice(0, 3); // Limit writers for display
  const stars = movie.credits?.cast.slice(0, 3); // Top 3 stars

  return (
    <div className="container mx-auto p-4 md:p-8 text-white"> {/* Assuming dark theme like IMDB */}
      <div className="flex flex-col lg:flex-row lg:gap-8"> {/* Main flex container for columns */}
        <div className="lg:w-3/4 space-y-12"> {/* Main content column */}
          {/* Section 1: Title and Meta (Year, PG, Runtime) */}
          <section className="mb-6"> {/* Note: mb-6 might be adjusted later due to space-y-12 */}
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

      {/* Section 2: Main Content (Poster | Trailer | Actions) */}
      <section className="mb-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left: Poster */}
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

        {/* Middle: Trailer */}
        <div className="w-full md:flex-grow min-w-0"> {/* min-w-0 for flex child if content overflows */}
          {mainTrailer ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl"> {/* Changed to aspect-video */}
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
            <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              <p>No trailer available.</p>
            </div>
          )}
        </div>

        {/* Right: Actions & Quick Info (Placeholders) */}
        <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-semibold">{movie.videos?.results?.length || 0}</div>
            <div className="text-sm text-gray-400">VIDEOS</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            {/* Placeholder for photos, TMDB API for images is structured differently */}
            <div className="text-2xl font-semibold">N/A</div>
            <div className="text-sm text-gray-400">PHOTOS</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">IMDb RATING</span>
              {/* Placeholder for IMDbPro link */}
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 text-2xl mr-1">&#9733;</span> {/* Star icon */}
              <span className="text-2xl font-bold">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
              <span className="text-gray-400 text-sm ml-1">/ 10</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{movie.vote_count.toLocaleString()} votes</div>
          </div>
          <button className="w-full bg-yellow-500 text-black font-semibold py-2.5 rounded-md hover:bg-yellow-600 transition-colors">
            Add to Watchlist
          </button>
           {/* Placeholder for more ratings */}
        </div>
      </section>

      {/* Section 3: Genres, Overview, Credits */}
      <section className="mb-8">
        {movie.genres && movie.genres.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(genre => (
                <Link key={genre.id} href={`/genre/${genre.id}`} legacyBehavior>
                  <a className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-full text-sm transition-colors">
                    {genre.name}
                  </a>
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

      {/* Existing Sections (Cast, Reviews, Recommendations) - can be refined later */}
      {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
        <section id="cast" className="my-12">
          <div className="flex items-center mb-6">
            <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
            <h2 className="text-3xl font-bold font-bebas-neue">Top cast</h2>
            {/* Optionally, add total cast count and link to full cast page later */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {movie.credits.cast.slice(0, 12).map((actor: CastMember) => (
              <div key={actor.id} className="flex items-center space-x-4">
                <Link href={`/person/${actor.id}`} className="flex-shrink-0">
                  {actor.profile_path ? (
                    <Image
                      src={`${IMG_URL}${actor.profile_path}`}
                      alt={actor.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-16 h-16" // Ensure fixed size
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs">
                      No Pic
                    </div>
                  )}
                </Link>
                <div className="min-w-0"> {/* Added min-w-0 for flex child if content overflows */}
                  <Link href={`/person/${actor.id}`} className="text-white hover:underline">
                    <p className="font-semibold text-md truncate" title={actor.name}>{actor.name}</p>
                  </Link>
                  <p className="text-sm text-gray-400 truncate" title={actor.character}>{actor.character}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {movie.reviews && movie.reviews.results && movie.reviews.results.length > 0 && (
        <section className="my-12">
          <div className="flex items-center mb-6">
            <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
            <h2 className="text-3xl font-bold font-bebas-neue">Reviews</h2>
          </div>
          <div className="space-y-4"> {/* Reduced space-y for tighter comment list */}
            {movie.reviews.results.map((review: Review) => (
              <div key={review.id} className="py-4 border-b border-gray-700 last:border-b-0">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {review.author_details.avatar_path ? (
                      <Image
                        src={review.author_details.avatar_path.startsWith('/http') ? review.author_details.avatar_path.substring(1) : `${IMG_URL}${review.author_details.avatar_path}`}
                        alt={review.author}
                        width={40} // Standard avatar size
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
                    <div className="bg-gray-700 rounded-xl p-3 shadow"> {/* Comment bubble */}
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-semibold text-sm text-white hover:underline">
                          <Link href={`#`}>{review.author}</Link> {/* Placeholder link for author profile */}
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
        </section>
      )}
        </div> {/* Closing main content column (lg:w-3/4) */}

        {/* Sidebar for Recommendations will be placed here */}
        <div className="w-full lg:w-1/4 lg:sticky lg:top-24 lg:self-start"> {/* Added w-full for <lg, lg:self-start for sidebar behavior */}
          {movie.recommendations && movie.recommendations.results && movie.recommendations.results.length > 0 && (
            <section className="my-12 lg:my-0">
              <div className="flex items-center mb-6">
                <span className="w-1 h-7 bg-yellow-400 mr-3"></span>
                <h2 className="text-3xl font-bold font-bebas-neue">Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {movie.recommendations.results.slice(0,10).map((recMovie: Movie) => (
                  <RecommendationCard key={recMovie.id} movie={recMovie} /> // Use RecommendationCard here
                ))}
              </div>
            </section>
          )}
        </div> {/* Closing sidebar column (lg:w-1/4) */}
      </div> {/* Closing main flex container */}
    </div>
  );
}

export async function generateMetadata({ params: paramsProp }: MovieDetailPageProps) {
  // Next.js error suggests awaiting params.
  const params = await paramsProp;
  const movieId = parseInt(params.id, 10);
  if (isNaN(movieId)) return { title: 'Movie Not Found' };
  
  const movieData = await fetchMovieDetails(movieId);
  if (!movieData) return { title: 'Movie Not Found' };

  return {
    title: `${movieData.title} (${movieData.release_date ? new Date(movieData.release_date).getFullYear() : ''}) - Movies Library`,
    description: movieData.overview || `Details about the movie ${movieData.title}.`,
  };
}

import { fetchMovieDetails } from '@/lib/tmdb';
import type { MovieDetails } from '@/lib/tmdb';
import MovieClientContent from './MovieClientContent'; // Import the new client component

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

// generateMetadata remains a server-side function
export async function generateMetadata({ params: paramsPromise }: MovieDetailPageProps) { // Destructure params directly
  const params = await paramsPromise; // Await the params object
  const movieId = parseInt(params.id, 10); // Use params.id
  if (isNaN(movieId)) {
    return { title: 'Movie Not Found' };
  }
  
  const movieData = await fetchMovieDetails(movieId);
  if (!movieData) {
    return { title: 'Movie Not Found' };
  }

  return {
    title: `${movieData.title} (${movieData.release_date ? new Date(movieData.release_date).getFullYear() : ''}) - Movies Library`,
    description: movieData.overview || `Details about the movie ${movieData.title}.`,
  };
}

// This is now a Server Component
export default async function MovieDetailPage({ params: paramsPromise }: MovieDetailPageProps) { // Destructure params directly
  const params = await paramsPromise; // Await the params object
  const movieId = parseInt(params.id, 10); // Use params.id

  if (isNaN(movieId)) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Invalid Movie ID.
      </div>
    );
  }

  const movie: MovieDetails | null = await fetchMovieDetails(movieId);

  if (!movie) {
    return (
      <div className="container mx-auto p-4 text-center">
        Movie not found or error fetching details.
      </div>
    );
  }

  // Pass the fetched movie data to the client component
  return <MovieClientContent initialMovie={movie} movieId={movie.id} />;
}

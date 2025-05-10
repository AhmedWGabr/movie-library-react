export const dynamic = 'force-dynamic'; // Opt into dynamic rendering

import { discoverMovies, Movie } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import PageTransitionWrapper from '@/components/PageTransitionWrapper'; // Assuming you have this for transitions
// import PaginationControls from '@/components/PaginationControls'; // Future: For client-side or server-action based pagination

export const metadata = {
  title: 'All Movies - Movies Library',
  description: 'Browse all movies available in the library.',
};

// For now, it will just load the first page. A more robust solution would handle page numbers via URL.
export default async function MoviesPage({ searchParams }: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any; // Workaround for Next.js type issue
}) {
  let currentPage = 1;
  const pageQueryParam = (searchParams as { page?: string | string[] | undefined }).page; 

  if (typeof pageQueryParam === 'string') {
    const pageNum = Number(pageQueryParam);
    if (!isNaN(pageNum) && pageNum > 0 && Number.isInteger(pageNum)) {
      currentPage = pageNum;
    }
  }
  const moviesData = await discoverMovies(currentPage, 'popularity.desc'); // Sort by popularity
  const movies: Movie[] = moviesData.results;
  // const totalPages = moviesData.total_pages; // For pagination controls

  return (
    <PageTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-bebas-neue mb-10 text-center sm:text-left">
          All Movies
        </h1>
        {/* Future: Add filter and sort controls here */}
        {movies && movies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={{ ...movie, media_type: "movie" as const }} 
                  disableInViewAnimation={true} 
                />
              ))}
            </div>
            {/* 
            Future: Add Pagination Controls
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              basePath="/movies" 
            /> 
            */}
            {moviesData.total_pages > 1 && (
                 <div className="flex justify-center mt-8">
                    {currentPage > 1 && (
                        <a href={`/movies?page=${currentPage - 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-l">
                            Previous
                        </a>
                    )}
                    {currentPage < moviesData.total_pages && (
                        <a href={`/movies?page=${currentPage + 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-r">
                            Next
                        </a>
                    )}
                </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-400 text-xl">
            No movies found. Try adjusting your filters or check back later.
          </p>
        )}
      </div>
    </PageTransitionWrapper>
  );
}

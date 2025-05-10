export const dynamic = 'force-dynamic'; // Opt into dynamic rendering

import { discoverTVShows, TVShow } from '@/lib/tmdb'; // Movie is used by MovieCard
import MovieCard from '@/components/MovieCard';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

export const metadata = {
  title: 'All TV Series - Movies Library',
  description: 'Browse all TV series available in the library.',
};

// Helper function to safely parse current page from searchParams
function getCurrentPage(searchParams: {  [key: string]: string | string[] | undefined }): number {
  let page = 1;
  const pageQueryParam = searchParams.page;
  if (typeof pageQueryParam === 'string') {
    const pageNum = Number(pageQueryParam);
    if (!isNaN(pageNum) && pageNum > 0 && Number.isInteger(pageNum)) {
      page = pageNum;
    }
  }
  return page;
}

export default async function SeriesPage({ searchParams: searchParamsPromise }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const searchParams = await searchParamsPromise; // Await the searchParams object
  const currentPage = getCurrentPage(searchParams);
  // Sort by popularity, can add more sorting/filtering options later
  const tvShowsData = await discoverTVShows(currentPage, 'popularity.desc');
  const series: TVShow[] = tvShowsData.results;

  return (
    <PageTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-bebas-neue mb-10 text-center sm:text-left">
          All TV Series
        </h1>
        {/* Future: Add filter and sort controls here */}
        {series && series.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {series.map((show) => {
                // Adapt TVShow to fit MultiSearchResult for MovieCard
                const cardItem = {
                  ...show, // Spread existing TVShow properties
                  title: show.name, // MovieCard might expect 'title' (MultiSearchResult specifices 'name' for TV)
                  name: show.name, // Ensure name is present for TV type in MultiSearchResult
                  release_date: show.first_air_date, // MovieCard might expect 'release_date' (MultiSearchResult specifices 'first_air_date' for TV)
                  first_air_date: show.first_air_date, // Ensure first_air_date is present
                  media_type: "tv" as const, // Add media_type
                };
                // The MovieCard prop 'movie' expects MultiSearchResult.
                // We are ensuring cardItem conforms to the TVShow part of MultiSearchResult.
                return <MovieCard key={show.id} movie={cardItem} disableInViewAnimation={true} />;
              })}
            </div>
            {tvShowsData.total_pages > 1 && (
                 <div className="flex justify-center mt-8">
                    {currentPage > 1 && (
                        <a href={`/series?page=${currentPage - 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-l">
                            Previous
                        </a>
                    )}
                    {currentPage < tvShowsData.total_pages && (
                        <a href={`/series?page=${currentPage + 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-r">
                            Next
                        </a>
                    )}
                </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-400 text-xl">
            No TV series found. Try adjusting your filters or check back later.
          </p>
        )}
      </div>
    </PageTransitionWrapper>
  );
}

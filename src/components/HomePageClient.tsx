'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import PersonCard from '@/components/PersonCard'; 
import type { Movie, TVShow, Person } from '@/lib/tmdb'; 

// Helper function to render a section
const renderSection = (title: string, items: (Movie | TVShow | Person)[], itemType: 'movie' | 'tv' | 'person') => {
  if (!items || items.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold font-montserrat mb-8 text-center sm:text-left"> {/* Font was changed to montserrat in earlier UI pass */}
          {title}
        </h2>
        <p className="text-center text-gray-400">No {title.toLowerCase()} found at the moment.</p>
      </section>
    );
  }

  return (
    <section className="mb-12 relative"> 
      <h2 className="text-3xl font-bold font-montserrat mb-8 text-center sm:text-left"> {/* Font was changed to montserrat */}
        {title}
      </h2>
      {/* Fade effect for left side - now theme-aware */}
      <div className="absolute inset-y-0 left-0 w-12 md:w-16 bg-gradient-to-r from-theme-bg-light dark:from-theme-bg-dark to-transparent pointer-events-none z-10"></div>
      <div className="flex overflow-x-auto py-4 gap-4 scrollbar-thin pl-4 pr-4">
        {items.map((item) => (
          <div key={item.id} className="w-40 md:w-48 flex-shrink-0">
            {itemType === 'person' ? (
              <PersonCard person={item as Person} />
            ) : (
              // Construct the correct MultiSearchResult type based on itemType
              <MovieCard
                movie={
                  itemType === 'movie'
                    ? { ...(item as Movie), media_type: 'movie' as const }
                    : { ...(item as TVShow), media_type: 'tv' as const }
                }
                disableInViewAnimation={true} // Disable animation as requested
              />
            )}
          </div>
        ))}
      </div>
      {/* Fade effect for right side - now theme-aware */}
      <div className="absolute inset-y-0 right-0 w-12 md:w-16 bg-gradient-to-l from-theme-bg-light dark:from-theme-bg-dark to-transparent pointer-events-none z-10"></div>
    </section>
  );
};

interface HomePageClientProps {
  nowPlayingMovies: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  popularTVShows: TVShow[];
  topRatedTVShows: TVShow[];
  popularPeople: Person[];
}

const HomePageClient = ({
  nowPlayingMovies,
  popularMovies,
  topRatedMovies,
  popularTVShows,
  topRatedTVShows,
  popularPeople,
}: HomePageClientProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-tmdb-accent text-tmdb-dark-blue py-16 px-4 sm:py-24 lg:py-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            Welcome.
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Millions of movies, TV shows and people to discover. Explore now.
          </p>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 text-lg text-gray-900 bg-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-tmdb-accent"
                placeholder="Search for a movie, tv show, person......"
              />
              <button
                type="submit"
                className="bg-white hover:bg-gray-200 text-tmdb-accent p-4 text-lg font-semibold rounded-r-md transition-colors duration-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Existing Content Sections */}
      <div className="container mx-auto px-4 py-8 mt-8">
        {renderSection("Now Playing", nowPlayingMovies, 'movie')} 
        {renderSection('Popular Movies', popularMovies, 'movie')}
        {renderSection('Top Rated Movies', topRatedMovies, 'movie')}
        {renderSection('Popular TV Shows', popularTVShows, 'tv')}
        {renderSection('Top Rated TV Shows', topRatedTVShows, 'tv')}
        {renderSection('Popular Actors', popularPeople, 'person')}
      </div>
    </>
  );
};

export default HomePageClient;

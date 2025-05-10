// This is now a Server Component for data fetching.
// Client-specific imports (useState, useRouter) and UI logic are moved to HomePageClient.tsx

import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchPopularTVShows,
  fetchTopRatedTVShows,
  fetchPopularPeople,
  type Movie, // Ensure types are imported if needed for props
  type TVShow,
  type Person,
} from '@/lib/tmdb';
import HomePageClient from '@/components/HomePageClient'; // Import the new client component

export default async function Home() {
  // Fetch all data in parallel
  const [
    nowPlayingMoviesData,
    popularMoviesData,
    topRatedMoviesData,
    popularTVShowsData,
    topRatedTVShowsData,
    popularPeopleData,
  ] = await Promise.all([
    fetchNowPlayingMovies(1),
    fetchPopularMovies(1),
    fetchTopRatedMovies(1),
    fetchPopularTVShows(1),
    fetchTopRatedTVShows(1),
    fetchPopularPeople(1),
  ]);

  const nowPlayingMovies: Movie[] = nowPlayingMoviesData.results.slice(0, 10); // Show 10 items
  const popularMovies: Movie[] = popularMoviesData.results.slice(0, 10);
  const topRatedMovies: Movie[] = topRatedMoviesData.results.slice(0, 10);
  const popularTVShows: TVShow[] = popularTVShowsData.results.slice(0, 10);
  const topRatedTVShows: TVShow[] = topRatedTVShowsData.results.slice(0, 10);
  const popularPeople: Person[] = popularPeopleData.results.slice(0, 10);

  return (
    <HomePageClient
      nowPlayingMovies={nowPlayingMovies}
      popularMovies={popularMovies}
      topRatedMovies={topRatedMovies}
      popularTVShows={popularTVShows}
      topRatedTVShows={topRatedTVShows}
      popularPeople={popularPeople}
    />
  );
}

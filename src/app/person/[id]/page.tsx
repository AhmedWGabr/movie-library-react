import { fetchPersonDetails, IMG_URL_ORIGINAL, Movie, TVShow, PersonDetails as PersonDetailsType, MultiSearchResult } from '@/lib/tmdb'; // Renamed PersonDetails to avoid conflict, Added MultiSearchResult
import Image from 'next/image';
// Link is not directly used here if MovieCard handles its own link
import MovieCard from '@/components/MovieCard'; // Re-use MovieCard for combined credits
import PageTransitionWrapper from '@/components/PageTransitionWrapper';
import { notFound } from 'next/navigation';

interface PersonPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any; // Workaround for Next.js type issue
}

// Function to generate metadata dynamically
export async function generateMetadata({ params }: PersonPageProps) {
  const personId = parseInt((params as { id: string }).id, 10);
  if (isNaN(personId)) {
    return { title: 'Person Not Found' };
  }
  const person = await fetchPersonDetails(personId);
  if (!person) {
    return { title: 'Person Not Found' };
  }
  return {
    title: `${person.name} - Movies Library`,
    description: person.biography ? `${person.biography.substring(0, 160)}...` : `Details about ${person.name}.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const personId = parseInt((params as { id: string }).id, 10);

  if (isNaN(personId)) {
    notFound(); // Or handle as an error page
  }

  const person = await fetchPersonDetails(personId);

  if (!person) {
    notFound(); // Or display a "Person not found" message
  }

  // Filter and sort combined credits (cast only, by vote_average)
  const knownFor = person.combined_credits?.cast
    ?.filter(item => 
      item && 
      typeof item.id === 'number' && 
      !isNaN(item.id) &&
      (item.media_type === 'movie' || item.media_type === 'tv') && // Ensure media_type is valid
      ((item.media_type === 'movie' && (item as Movie).title) || (item.media_type === 'tv' && (item as TVShow).name)) // Ensure title/name exists
    )
    .map(item => {
      // Explicitly define the structure for MovieCard compatibility
      const movieCardItem = {
        id: item.id,
        title: item.media_type === 'movie' ? (item as Movie).title : (item as TVShow).name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.media_type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date,
        overview: item.overview,
        vote_average: item.vote_average || 0,
        vote_count: item.vote_count || 0,
        media_type: item.media_type,
      };
      return movieCardItem as MultiSearchResult; // Cast to MultiSearchResult for MovieCard
    })
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)) // Sort by vote_average
    .slice(0, 10); // Take top 10

  return (
    <PageTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={person.profile_path ? `${IMG_URL_ORIGINAL}${person.profile_path}` : '/logo64x64.png'}
                alt={person.name}
                fill
                className="object-cover" // Added object-cover
                sizes="(max-width: 768px) 100vw, 33vw" // Example sizes, adjust as needed
                priority // Prioritize loading of main image
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-2">{(person as PersonDetailsType).name}</h1>
            {(person as PersonDetailsType).birthday && (
              <p className="text-md text-gray-400 mb-1">
                Born: {new Date((person as PersonDetailsType).birthday!).toLocaleDateString()}
                {(person as PersonDetailsType).place_of_birth && ` in ${(person as PersonDetailsType).place_of_birth}`}
              </p>
            )}
            {(person as PersonDetailsType).deathday && (
              <p className="text-md text-gray-400 mb-4">
                Died: {new Date((person as PersonDetailsType).deathday!).toLocaleDateString()}
              </p>
            )}
            
            <h2 className="text-2xl font-semibold font-montserrat mt-6 mb-3">Biography</h2>
            {(person as PersonDetailsType).biography ? (
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{(person as PersonDetailsType).biography}</p>
            ) : (
              <p className="text-gray-400">No biography available for {(person as PersonDetailsType).name}.</p>
            )}
          </div>
        </div>

        {knownFor && knownFor.length > 0 && (
          <section className="mt-12">
            <h2 className="text-3xl font-bold font-montserrat mb-6">Known For</h2>
            {/* Horizontal scroll container */}
            <div className="relative">
              {/* Fade effect for left side - theme-aware (assuming theme variables are set up or use direct colors) */}
              <div className="absolute inset-y-0 left-0 w-12 md:w-16 bg-gradient-to-r from-theme-bg-light dark:from-theme-bg-dark to-transparent pointer-events-none z-10 hidden sm:block"></div>
              <div className="flex overflow-x-auto py-4 gap-4 scrollbar-thin pl-4 pr-4">
                {knownFor.map((item) => (
                  // Ensure MovieCard or its container has a fixed width for horizontal scrolling items
                  <div key={item.id} className="w-40 md:w-48 flex-shrink-0">
                    <MovieCard movie={item} />
                  </div>
                ))}
              </div>
              {/* Fade effect for right side - theme-aware */}
              <div className="absolute inset-y-0 right-0 w-12 md:w-16 bg-gradient-to-l from-theme-bg-light dark:from-theme-bg-dark to-transparent pointer-events-none z-10 hidden sm:block"></div>
            </div>
          </section>
        )}
      </div>
    </PageTransitionWrapper>
  );
}

export const dynamic = 'force-dynamic'; // Opt into dynamic rendering

import { fetchPopularPeople, Person } from '@/lib/tmdb';
import PersonCard from '@/components/PersonCard';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

export const metadata = {
  title: 'Popular People - Movies Library',
  description: 'Browse popular actors and people in the film industry.',
};

export default async function PeoplePage({ searchParams }: { searchParams?: { page?: string | string[] } }) {
  let currentPage = 1;
  const pageQueryParam = searchParams?.page;

  if (typeof pageQueryParam === 'string') {
    const pageNum = Number(pageQueryParam);
    if (!isNaN(pageNum) && pageNum > 0 && Number.isInteger(pageNum)) {
      currentPage = pageNum;
    }
  }

  const peopleData = await fetchPopularPeople(currentPage);
  const people: Person[] = peopleData.results;

  return (
    <PageTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-bebas-neue mb-10 text-center sm:text-left">
          Popular People
        </h1>
        {/* Future: Add filter and sort controls here */}
        {people && people.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {people.filter(person => person && typeof person.id === 'number' && !isNaN(person.id)).map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
            {peopleData.total_pages > 1 && (
                 <div className="flex justify-center mt-8">
                    {currentPage > 1 && (
                        <a href={`/people?page=${currentPage - 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-l">
                            Previous
                        </a>
                    )}
                    {currentPage < peopleData.total_pages && (
                        <a href={`/people?page=${currentPage + 1}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-r">
                            Next
                        </a>
                    )}
                </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-400 text-xl">
            No people found. Please check back later.
          </p>
        )}
      </div>
    </PageTransitionWrapper>
  );
}

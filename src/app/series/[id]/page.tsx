// src/app/series/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { fetchTVShowDetails, TVShowDetails } from '@/lib/tmdb';
import SeriesClientContent from './SeriesClientContent.tsx';
import { notFound } from 'next/navigation';

interface SeriesDetailPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any; // Workaround for Next.js type issue
}

export async function generateMetadata({ params }: SeriesDetailPageProps) {
  const seriesId = parseInt((params as { id: string }).id, 10);

  if (isNaN(seriesId)) {
    return { title: 'TV Series Not Found' };
  }
  const seriesData = await fetchTVShowDetails(seriesId);
  if (!seriesData) {
    return { title: 'TV Series Not Found' };
  }

  return {
    title: `${seriesData.name} (${seriesData.first_air_date ? new Date(seriesData.first_air_date).getFullYear() : ''}) - Movies Library`,
    description: seriesData.overview || `Details about the TV series ${seriesData.name}.`,
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const seriesId = parseInt((params as { id: string }).id, 10);

  if (isNaN(seriesId)) {
    notFound();
  }

  const series: TVShowDetails | null = await fetchTVShowDetails(seriesId);

  if (!series) {
    notFound();
  }

  return <SeriesClientContent initialSeries={series} seriesId={series.id} />;
}

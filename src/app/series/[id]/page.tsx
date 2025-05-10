// src/app/series/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { fetchTVShowDetails, TVShowDetails } from '@/lib/tmdb';
import SeriesClientContent from './SeriesClientContent.tsx';
import { notFound } from 'next/navigation';

interface SeriesDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params: paramsPromise }: SeriesDetailPageProps) {
  const params = await paramsPromise;
  const seriesId = parseInt(params.id, 10);

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

export default async function SeriesDetailPage({ params: paramsPromise }: SeriesDetailPageProps) {
  const params = await paramsPromise;
  const seriesId = parseInt(params.id, 10);

  if (isNaN(seriesId)) {
    notFound();
  }

  const series: TVShowDetails | null = await fetchTVShowDetails(seriesId);

  if (!series) {
    notFound();
  }

  return <SeriesClientContent initialSeries={series} seriesId={series.id} />;
}

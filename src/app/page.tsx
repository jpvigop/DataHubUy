import { HomeContent } from '@/components/HomeContent';
import { parseCatalogQuery } from '@/lib/catalog-query';
import { CkanError, getDatasetDetails, searchDatasets } from '@/lib/ckan';
import type { Dataset } from '@/lib/types';

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof CkanError || error instanceof Error) {
    return error.message;
  }

  return 'No se pudieron cargar los datos del catalogo.';
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = parseCatalogQuery(resolvedSearchParams);

  let datasets: Dataset[] = [];
  let total = 0;
  let catalogError: string | null = null;
  let selectedDataset: Dataset | null = null;
  let selectedDatasetError: string | null = null;

  try {
    const searchResult = await searchDatasets(query);
    datasets = searchResult.datasets;
    total = searchResult.total;
  } catch (error) {
    catalogError = getErrorMessage(error);
  }

  if (query.dataset) {
    try {
      selectedDataset = await getDatasetDetails(query.dataset);
    } catch (error) {
      selectedDatasetError = getErrorMessage(error);
    }
  }

  return (
    <HomeContent
      catalogError={catalogError}
      datasets={datasets}
      query={query}
      selectedDataset={selectedDataset}
      selectedDatasetError={selectedDatasetError}
      total={total}
    />
  );
}

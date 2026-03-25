'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { DataViewer } from '@/components/DataViewer';
import { DatasetDrawer } from '@/components/DatasetDrawer';
import { DatasetTable } from '@/components/DatasetTable';
import { Pagination } from '@/components/Pagination';
import { SavedDatasetsPanel } from '@/components/SavedDatasetsPanel';
import { SearchInput } from '@/components/SearchInput';
import {
  createCatalogHref,
  ITEMS_PER_PAGE,
  mergeCatalogQuery,
  type CatalogQueryState,
  type CatalogSortField,
} from '@/lib/catalog-query';
import { useSavedDatasets } from '@/lib/hooks/useSavedDatasets';
import type { Dataset } from '@/lib/types';

interface HomeContentProps {
  catalogError: string | null;
  datasets: Dataset[];
  query: CatalogQueryState;
  selectedDataset: Dataset | null;
  selectedDatasetError: string | null;
  total: number;
}

function getDefaultDirection(field: CatalogSortField) {
  return field === 'title' ? 'asc' : 'desc';
}

export function HomeContent({
  catalogError,
  datasets,
  query,
  selectedDataset,
  selectedDatasetError,
  total,
}: HomeContentProps) {
  const router = useRouter();
  const { isSaved, removeSaved, savedDatasets, toggleSaved } = useSavedDatasets();

  const activeResource = useMemo(
    () =>
      selectedDataset?.resources.find((resource) => resource.id === query.resource) ??
      null,
    [query.resource, selectedDataset]
  );

  const navigate = useCallback(
    (
      patch: Partial<CatalogQueryState>,
      options?: Parameters<typeof mergeCatalogQuery>[2]
    ) => {
      router.push(createCatalogHref(mergeCatalogQuery(query, patch, options)));
    },
    [query, router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      navigate(
        {
          q: value || undefined,
        },
        {
          clearDataset: true,
          resetPage: true,
        }
      );
    },
    [navigate]
  );

  const handleSort = useCallback(
    (field: CatalogSortField) => {
      navigate(
        {
          direction:
            query.sort === field
              ? query.direction === 'asc'
                ? 'desc'
                : 'asc'
              : getDefaultDirection(field),
          sort: field,
        },
        {
          clearDataset: true,
          resetPage: true,
        }
      );
    },
    [navigate, query.direction, query.sort]
  );

  const handleOpenDataset = useCallback(
    (datasetId: string) => {
      navigate(
        {
          dataset: datasetId,
        },
        {
          clearResource: true,
        }
      );
    },
    [navigate]
  );

  const handleCloseDataset = useCallback(() => {
    navigate(
      {},
      {
        clearDataset: true,
      }
    );
  }, [navigate]);

  const handleOpenResource = useCallback(
    (resourceId: string) => {
      if (!selectedDataset) {
        return;
      }

      navigate({
        dataset: selectedDataset.id,
        resource: resourceId,
      });
    },
    [navigate, selectedDataset]
  );

  const handleCloseResource = useCallback(() => {
    navigate(
      {},
      {
        clearResource: true,
      }
    );
  }, [navigate]);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Explorador de Datos Abiertos de Uruguay
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Busca datasets del catalogo nacional, abre sus recursos y previsualiza
            tablas directamente desde el navegador.
          </p>
        </div>

        <SearchInput initialQuery={query.q ?? ''} onSearch={handleSearch} />
      </section>

      {catalogError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {catalogError}
        </div>
      )}

      {selectedDatasetError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {selectedDatasetError}
        </div>
      )}

      <SavedDatasetsPanel
        datasets={savedDatasets}
        onOpenDataset={handleOpenDataset}
        onRemoveDataset={removeSaved}
      />

      {!catalogError && (
        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>{total.toLocaleString('es-UY')} datasets encontrados</p>
          <p>{ITEMS_PER_PAGE} por pagina</p>
        </div>
      )}

      {!catalogError && datasets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No se encontraron datasets para los filtros actuales.
        </div>
      ) : (
        !catalogError && (
          <>
            <DatasetTable
              datasets={datasets}
              onOpenDataset={handleOpenDataset}
              onSort={handleSort}
              onToggleSaved={toggleSaved}
              query={query}
              savedDatasetIds={new Set(savedDatasets.map((dataset) => dataset.id))}
            />

            <Pagination
              currentPage={query.page}
              itemsPerPage={ITEMS_PER_PAGE}
              query={query}
              totalItems={total}
            />
          </>
        )
      )}

      {selectedDataset && (
        <DatasetDrawer
          activeResourceId={query.resource}
          dataset={selectedDataset}
          isSaved={isSaved(selectedDataset.id)}
          onClose={handleCloseDataset}
          onOpenResource={handleOpenResource}
          onToggleSaved={toggleSaved}
        />
      )}

      {activeResource && (
        <DataViewer resource={activeResource} onClose={handleCloseResource} />
      )}
    </div>
  );
}

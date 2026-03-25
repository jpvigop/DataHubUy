'use client';

import {
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

import type {
  CatalogQueryState,
  CatalogSortField,
} from '@/lib/catalog-query';
import type { Dataset } from '@/lib/types';

interface DatasetTableProps {
  datasets: Dataset[];
  onOpenDataset: (datasetId: string) => void;
  onSort: (field: CatalogSortField) => void;
  onToggleSaved: (dataset: Dataset) => void;
  query: CatalogQueryState;
  savedDatasetIds: Set<string>;
}

function SortButton({
  active,
  children,
  direction,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  direction: CatalogQueryState['direction'];
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 hover:text-primary"
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      {active && <span className="text-xs uppercase">{direction}</span>}
    </button>
  );
}

export function DatasetTable({
  datasets,
  onOpenDataset,
  onSort,
  onToggleSaved,
  query,
  savedDatasetIds,
}: DatasetTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-50 text-left dark:bg-slate-800/80">
          <tr>
            <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              Guardar
            </th>
            <th
              aria-sort={
                query.sort === 'title'
                  ? query.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
              scope="col"
            >
              <SortButton
                active={query.sort === 'title'}
                direction={query.direction}
                onClick={() => onSort('title')}
              >
                Titulo
              </SortButton>
            </th>
            <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              Organizacion
            </th>
            <th
              aria-sort={
                query.sort === 'metadata_modified'
                  ? query.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
              scope="col"
            >
              <SortButton
                active={query.sort === 'metadata_modified'}
                direction={query.direction}
                onClick={() => onSort('metadata_modified')}
              >
                Actualizado
              </SortButton>
            </th>
            <th
              aria-sort={
                query.sort === 'num_resources'
                  ? query.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
              scope="col"
            >
              <SortButton
                active={query.sort === 'num_resources'}
                direction={query.direction}
                onClick={() => onSort('num_resources')}
              >
                Recursos
              </SortButton>
            </th>
            <th className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset) => {
            const isSelected = dataset.id === query.dataset;
            const isSaved = savedDatasetIds.has(dataset.id);

            return (
              <tr
                className={
                  isSelected
                    ? 'bg-primary/5 dark:bg-primary/10'
                    : 'border-t border-slate-200 dark:border-slate-800'
                }
                key={dataset.id}
              >
                <td className="px-4 py-4 align-top">
                  <button
                    aria-label={
                      isSaved
                        ? `Quitar ${dataset.title} de guardados`
                        : `Guardar ${dataset.title}`
                    }
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
                    onClick={() => onToggleSaved(dataset)}
                    type="button"
                  >
                    {isSaved ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-4 align-top">
                  <button
                    className="text-left"
                    onClick={() => onOpenDataset(dataset.id)}
                    type="button"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {dataset.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {dataset.description || 'Sin descripcion disponible.'}
                    </p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">
                  {dataset.organization.title}
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">
                  {new Date(dataset.metadata_modified).toLocaleDateString('es-UY')}
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">
                  {dataset.resources.length}
                </td>
                <td className="px-4 py-4 align-top">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary dark:hover:text-primary"
                    onClick={() => onOpenDataset(dataset.id)}
                    type="button"
                  >
                    Ver detalle
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

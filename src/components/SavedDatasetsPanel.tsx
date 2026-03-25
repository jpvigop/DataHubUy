'use client';

import { BookmarkIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { SavedDatasetRef } from '@/lib/types';

interface SavedDatasetsPanelProps {
  datasets: SavedDatasetRef[];
  onOpenDataset: (datasetId: string) => void;
  onRemoveDataset: (datasetId: string) => void;
}

export function SavedDatasetsPanel({
  datasets,
  onOpenDataset,
  onRemoveDataset,
}: SavedDatasetsPanelProps) {
  if (datasets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <BookmarkIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Datasets guardados
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => onOpenDataset(dataset.id)}
              type="button"
            >
              <p className="font-medium text-slate-900 dark:text-white">
                {dataset.title}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {dataset.organization}
              </p>
            </button>

            <button
              aria-label={`Quitar ${dataset.title} de guardados`}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              onClick={() => onRemoveDataset(dataset.id)}
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

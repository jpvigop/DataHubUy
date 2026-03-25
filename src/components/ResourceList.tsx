'use client';

import {
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

import type { Resource } from '@/lib/types';

function formatBytes(bytes?: number | null) {
  if (!bytes) {
    return 'Tamano no disponible';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getPreviewPriority(resource: Resource) {
  if (resource.datastore_active && resource.format.toLowerCase() === 'csv') {
    return 3;
  }

  if (resource.datastore_active) {
    return 2;
  }

  if (resource.format.toLowerCase() === 'csv') {
    return 1;
  }

  return 0;
}

interface ResourceListProps {
  activeResourceId?: string;
  onPreview: (resourceId: string) => void;
  resources: Resource[];
}

export function ResourceList({
  activeResourceId,
  onPreview,
  resources,
}: ResourceListProps) {
  const sortedResources = [...resources].sort((left, right) => {
    const priorityDelta = getPreviewPriority(right) - getPreviewPriority(left);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return left.name.localeCompare(right.name, 'es');
  });

  if (sortedResources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Este dataset no tiene recursos disponibles.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recursos
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Los recursos con datastore activo y formato CSV aparecen primero.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sortedResources.map((resource) => {
          const previewable =
            resource.datastore_active && resource.format.toLowerCase() === 'csv';

          return (
            <article
              className={
                activeResourceId === resource.id
                  ? 'rounded-xl border border-primary bg-primary/5 p-4 dark:bg-primary/10'
                  : 'rounded-xl border border-slate-200 p-4 dark:border-slate-800'
              }
              key={resource.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {resource.name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {resource.description || 'Sin descripcion disponible.'}
                  </p>
                </div>
                <a
                  aria-label={`Abrir recurso ${resource.name} en una nueva pestana`}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
                  href={resource.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <DocumentIcon className="h-4 w-4" />
                  {resource.format}
                </span>
                <span>{formatBytes(resource.size)}</span>
                <span>
                  {resource.datastore_active
                    ? 'Disponible para previsualizacion'
                    : 'Sin datastore activo'}
                </span>
              </div>

              {previewable && (
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                  onClick={() => onPreview(resource.id)}
                  type="button"
                >
                  <TableCellsIcon className="h-4 w-4" />
                  Previsualizar datos
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

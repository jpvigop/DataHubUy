'use client';

import { useEffect, useRef } from 'react';
import { BookmarkIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

import { ResourceList } from '@/components/ResourceList';
import { useDialogFocusTrap } from '@/lib/hooks/useDialogFocusTrap';
import type { Dataset } from '@/lib/types';

interface DatasetDrawerProps {
  activeResourceId?: string;
  dataset: Dataset;
  isSaved: boolean;
  onClose: () => void;
  onOpenResource: (resourceId: string) => void;
  onToggleSaved: (dataset: Dataset) => void;
}

export function DatasetDrawer({
  activeResourceId,
  dataset,
  isSaved,
  onClose,
  onOpenResource,
  onToggleSaved,
}: DatasetDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap(true, dialogRef, onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-slate-950/45"
        onClick={onClose}
      />

      <aside
        aria-labelledby="dataset-drawer-title"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-900"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex min-h-full flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dataset.organization.title}
                </p>
                <h2
                  className="text-xl font-semibold text-slate-900 dark:text-white"
                  id="dataset-drawer-title"
                >
                  {dataset.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label={
                    isSaved ? 'Quitar dataset de guardados' : 'Guardar dataset'
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  onClick={() => onToggleSaved(dataset)}
                  type="button"
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="h-6 w-6 text-primary" />
                  ) : (
                    <BookmarkIcon className="h-6 w-6" />
                  )}
                </button>
                <button
                  aria-label="Cerrar detalle del dataset"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  onClick={onClose}
                  type="button"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-6 px-5 py-5">
            <section className="space-y-3">
              <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-white">Creado</p>
                  <p>{new Date(dataset.metadata_created).toLocaleDateString('es-UY')}</p>
                </div>
                <div className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Ultima actualizacion
                  </p>
                  <p>{new Date(dataset.metadata_modified).toLocaleDateString('es-UY')}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none dark:prose-invert">
                <p>{dataset.description || 'Sin descripcion disponible.'}</p>
              </div>
            </section>

            <ResourceList
              activeResourceId={activeResourceId}
              onPreview={onOpenResource}
              resources={dataset.resources}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

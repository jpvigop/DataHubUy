'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { DataTable } from '@/components/DataViewer/DataTable';
import { DataVisualizer } from '@/components/DataViewer/DataVisualizer';
import { getResourcePreview } from '@/lib/datastore-client';
import { useDialogFocusTrap } from '@/lib/hooks/useDialogFocusTrap';
import type {
  DatastoreField,
  DatastoreRecord,
  Resource,
} from '@/lib/types';

interface DataViewerProps {
  onClose: () => void;
  resource: Resource;
}

const PAGE_SIZE = 100;

export function DataViewer({ onClose, resource }: DataViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'chart' | 'table'>('table');
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<DatastoreField[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<DatastoreRecord[]>([]);
  const [total, setTotal] = useState(0);

  useDialogFocusTrap(true, dialogRef, onClose);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const preview = await getResourcePreview(resource.id, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      setFields(preview.fields);
      setRecords(preview.records);
      setTotal(preview.total);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'No se pudieron cargar los datos del recurso.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, resource.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setActiveView('table');
    setPage(1);
  }, [resource.id]);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-slate-950/55"
        onClick={onClose}
      />

      <section
        aria-labelledby="resource-preview-title"
        aria-modal="true"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
      >
        <div
          className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          ref={dialogRef}
        >
          <header className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2
                  className="text-xl font-semibold text-slate-900 dark:text-white"
                  id="resource-preview-title"
                >
                  {resource.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {loading ? 'Cargando datos...' : `${total.toLocaleString('es-UY')} registros`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto">
                <button
                  aria-pressed={activeView === 'table'}
                  className={
                    activeView === 'table'
                      ? 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200'
                  }
                  onClick={() => setActiveView('table')}
                  type="button"
                >
                  Tabla
                </button>
                <button
                  aria-pressed={activeView === 'chart'}
                  className={
                    activeView === 'chart'
                      ? 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200'
                  }
                  onClick={() => setActiveView('chart')}
                  type="button"
                >
                  Graficos
                </button>
                <button
                  aria-label="Cerrar previsualizacion del recurso"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  onClick={onClose}
                  type="button"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/30">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">
                    No se pudo abrir el recurso
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                  onClick={fetchData}
                  type="button"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            ) : activeView === 'table' ? (
              <DataTable
                fields={fields}
                onPageChange={setPage}
                page={page}
                records={records}
                total={total}
              />
            ) : (
              <DataVisualizer fields={fields} records={records} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

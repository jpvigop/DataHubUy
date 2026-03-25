'use client';

import type { DatastoreField, DatastoreRecord } from '@/lib/types';

interface DataTableProps {
  fields: DatastoreField[];
  onPageChange: (page: number) => void;
  page: number;
  records: DatastoreRecord[];
  total: number;
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export function DataTable({
  fields,
  onPageChange,
  page,
  records,
  total,
}: DataTableProps) {
  const visibleFields = fields.filter((field) => !field.id.startsWith('_'));
  const pageSize = 100;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800">
            <tr>
              {visibleFields.map((field) => (
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                  key={field.id}
                  scope="col"
                >
                  {field.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr
                className="border-t border-slate-200 dark:border-slate-800"
                key={`${page}-${index}`}
              >
                {visibleFields.map((field) => (
                  <td
                    className="max-w-[260px] px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-300"
                    key={field.id}
                  >
                    <div className="line-clamp-4 whitespace-pre-wrap break-words">
                      {formatCell(record[field.id])}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-600 dark:text-slate-300">
          Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de{' '}
          {total} registros
        </p>

        <div className="flex gap-2">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            Anterior
          </button>
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={page * pageSize >= total}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

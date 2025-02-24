'use client';

import { useState, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Field {
  id: string;
  type: string;
}

interface DataTableProps {
  fields: Field[];
  records: any[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function DataTable({ fields, records, total, page, onPageChange }: DataTableProps) {
  // Filter out internal fields
  const visibleFields = useMemo(() => 
    fields.filter(f => !f.id.startsWith('_')),
    [fields]
  );

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (fieldId: string) => {
    if (sortField === fieldId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldId);
      setSortDirection('asc');
    }
  };

  const filteredRecords = records.filter(record => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      const recordValue = String(record[field]).toLowerCase();
      return recordValue.includes(value.toLowerCase());
    });
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto border rounded-lg dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {visibleFields.map(field => (
                <th
                  key={field.id}
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 sticky top-0"
                >
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <button
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort(field.id)}
                    >
                      <span className="whitespace-nowrap">{field.id}</span>
                      {sortField === field.id && (
                        sortDirection === 'asc' ? (
                          <ChevronUpIcon className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                        )
                      )}
                    </button>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filtrar..."
                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        value={filters[field.id] || ''}
                        onChange={e => setFilters(prev => ({
                          ...prev,
                          [field.id]: e.target.value
                        }))}
                      />
                      <MagnifyingGlassIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRecords.map((record, idx) => (
              <tr
                key={idx}
                className={clsx(
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                )}
              >
                {visibleFields.map(field => (
                  <td
                    key={field.id}
                    className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap"
                  >
                    {String(record[field.id] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((page - 1) * 100) + 1} a {Math.min(page * 100, total)} de {total} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * 100 >= total}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
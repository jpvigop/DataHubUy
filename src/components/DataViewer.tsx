import { useState, useEffect, useCallback } from 'react';
import type { Resource } from '@/lib/api';
import { api } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataViewer/DataTable';
import { DataVisualizer } from '@/components/DataViewer/DataVisualizer';
import { clsx } from 'clsx';

interface Field {
  id: string;
  type: string;
}

export function DataViewer({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching data for resource:', resource.id);
      setLoading(true);
      setError(null);

      const result = await api.getResourceData(resource.id, {
        limit: 100,
        offset: (page - 1) * 100
      });

      if (!result.fields || result.fields.length === 0) {
        throw new Error('No se encontraron campos en el recurso');
      }

      if (!result.records || result.records.length === 0) {
        throw new Error('No se encontraron registros en el recurso');
      }

      console.log('Fetched data:', {
        fields: result.fields.length,
        records: result.records.length,
        total: result.total
      });

      setFields(result.fields);
      setRecords(result.records);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message
        || err.message
        || 'Error al cargar los datos';
      
      setError(`${errorMessage}. Por favor, verifique que el recurso tenga datos activos en el datastore.`);
    } finally {
      setLoading(false);
    }
  }, [resource.id, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Error</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{resource.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Cargando...' : `${total.toLocaleString()} registros`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border dark:border-gray-700">
              <button
                onClick={() => setActiveView('table')}
                className={`px-4 py-2 ${
                  activeView === 'table'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setActiveView('chart')}
                className={`px-4 py-2 ${
                  activeView === 'chart'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Gráficos
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : activeView === 'table' ? (
            <div className="h-full overflow-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr>
                      {fields.filter(f => !f.id.startsWith('_')).map(field => (
                        <th
                          key={field.id}
                          className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b dark:border-gray-700 min-w-[150px] bg-white dark:bg-gray-800"
                        >
                          {field.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {records.map((record, idx) => (
                      <tr
                        key={idx}
                        className={clsx(
                          'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                          idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'
                        )}
                      >
                        {fields.filter(f => !f.id.startsWith('_')).map(field => (
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
            </div>
          ) : (
            <DataVisualizer
              fields={fields}
              records={records}
            />
          )}
        </div>

        {activeView === 'table' && (
          <div className="border-t dark:border-gray-700 p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {((page - 1) * 100) + 1} a {Math.min(page * 100, total)} de {total} registros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 100 >= total}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
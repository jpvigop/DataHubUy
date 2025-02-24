'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, Resource } from '@/lib/api';
import { DataTable } from './DataTable';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { DataVisualizer } from './DataVisualizer';

interface DataViewerProps {
  resource: Resource;
  onClose: () => void;
}

interface Field {
  id: string;
  type: string;
}

export function DataViewer({ resource, onClose }: DataViewerProps) {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');
  const [error, setError] = useState<string | null>(null);

  console.log('DataViewer mounted with resource:', resource);

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

  if (!resource.datastore_active) {
    console.log('Resource is not datastore active:', resource);
    return null;
  }

  const modal = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
      <div className="bg-white rounded-lg w-[1200px] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{resource.name}</h2>
            <p className="text-sm text-gray-500">
              {loading ? 'Cargando...' : `${total.toLocaleString()} registros`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => setActiveView('table')}
                className={`px-4 py-2 ${
                  activeView === 'table'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setActiveView('chart')}
                className={`px-4 py-2 ${
                  activeView === 'chart'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Gráficos
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-red-500 text-center mb-4">
                <p className="text-lg font-semibold mb-2">Error al cargar los datos</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Reintentar
              </button>
            </div>
          ) : activeView === 'table' ? (
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    {fields.filter(f => !f.id.startsWith('_')).map(field => (
                      <th
                        key={field.id}
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-y"
                      >
                        {field.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {fields.filter(f => !f.id.startsWith('_')).map(field => (
                        <td
                          key={field.id}
                          className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {String(record[field.id] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DataVisualizer
              fields={fields}
              records={records}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
} 
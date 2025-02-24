'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Dataset } from '@/lib/api';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ResourceList } from './ResourceList';
import clsx from 'clsx';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface DatasetTableProps {
  datasets: Dataset[];
  onSortAction: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Memoized table row component
const DatasetRow = memo(({ 
  dataset, 
  isSelected, 
  isFavorite,
  onSelect, 
  onToggleFavorite 
}: { 
  dataset: Dataset;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (dataset: Dataset) => void;
  onToggleFavorite: (dataset: Dataset) => void;
}) => (
  <tr
    onClick={() => onSelect(dataset)}
    className={clsx(
      'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
      isSelected && 'bg-primary/5 dark:bg-primary/10'
    )}
  >
    <td className="px-4 py-3 text-sm border-b dark:border-gray-700">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(dataset);
        }}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        {isFavorite ? (
          <StarIconSolid className="w-5 h-5 text-primary" />
        ) : (
          <StarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </button>
    </td>
    <td className="px-4 py-3 text-sm border-b dark:border-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
        {dataset.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mt-1">
        {dataset.description}
      </p>
    </td>
    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
      {dataset.organization.title}
    </td>
    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 whitespace-nowrap">
      {new Date(dataset.metadata_created).toLocaleDateString('es')}
    </td>
    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
      <div className="flex items-center gap-1">
        <DocumentIcon className="w-4 h-4" />
        <span>{dataset.resources.length}</span>
      </div>
    </td>
  </tr>
));

DatasetRow.displayName = 'DatasetRow';

// Memoized filter input component
const FilterInput = memo(({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="mt-2 relative">
    <input
      type="text"
      placeholder={placeholder}
      className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
    <MagnifyingGlassIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
  </div>
));

FilterInput.displayName = 'FilterInput';

export function DatasetTable({ datasets, onSortAction, sortField, sortDirection }: DatasetTableProps) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Memoize filtered datasets
  const filteredDatasets = useMemo(() => {
    return datasets.filter(dataset => {
      if (showOnlyFavorites && !isFavorite(dataset.id)) {
        return false;
      }

      return Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        const fieldValue = field === 'organization' 
          ? dataset.organization.title.toLowerCase()
          : String(dataset[field as keyof Dataset]).toLowerCase();
        return fieldValue.includes(value.toLowerCase());
      });
    });
  }, [datasets, filters, showOnlyFavorites, isFavorite]);

  const handleSort = useCallback((field: string) => {
    onSortAction(field);
  }, [onSortAction]);

  const handleFilterChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
              showOnlyFavorites
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
            )}
          >
            {showOnlyFavorites ? (
              <StarIconSolid className="w-5 h-5" />
            ) : (
              <StarIcon className="w-5 h-5" />
            )}
            {showOnlyFavorites ? 'Mostrando favoritos' : 'Mostrar favoritos'}
            {showOnlyFavorites && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="w-10 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-200 border-b dark:border-gray-700">
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-200 border-b dark:border-gray-700 w-[45%]">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('title')}
                  >
                    Título
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    )}
                  </button>
                </div>
                <div className="mt-2 relative">
                  <FilterInput
                    value={filters.title || ''}
                    onChange={handleFilterChange.bind(null, 'title')}
                    placeholder="Filtrar por título..."
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-200 border-b dark:border-gray-700 w-[35%]">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('organization.title')}
                  >
                    Organización
                    {sortField === 'organization.title' && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    )}
                  </button>
                </div>
                <div className="mt-2 relative">
                  <FilterInput
                    value={filters.organization || ''}
                    onChange={handleFilterChange.bind(null, 'organization')}
                    placeholder="Filtrar por organización..."
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-200 border-b dark:border-gray-700 w-[10%]">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 hover:text-primary whitespace-nowrap"
                    onClick={() => handleSort('metadata_created')}
                  >
                    Fecha
                    {sortField === 'metadata_created' && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    )}
                  </button>
                </div>
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-200 border-b dark:border-gray-700 w-[10%]">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('num_resources')}
                  >
                    Recursos
                    {sortField === 'num_resources' && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    )}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDatasets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {Object.keys(filters).some(k => filters[k]) 
                    ? 'No se encontraron datasets con los filtros aplicados'
                    : showOnlyFavorites
                    ? 'No hay datasets favoritos'
                    : 'No hay datasets disponibles'}
                </td>
              </tr>
            ) : (
              filteredDatasets.map((dataset) => (
                <DatasetRow
                  key={dataset.id}
                  dataset={dataset}
                  isSelected={selectedDataset?.id === dataset.id}
                  isFavorite={isFavorite(dataset.id)}
                  onSelect={setSelectedDataset}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sliding Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 right-0 w-[500px] bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50',
        selectedDataset ? 'translate-x-0' : 'translate-x-full'
      )}>
        {selectedDataset && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedDataset.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDataset.organization.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(selectedDataset);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  {isFavorite(selectedDataset.id) ? (
                    <StarIconSolid className="w-6 h-6 text-primary" />
                  ) : (
                    <StarIcon className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDataset(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedDataset.description}
                </p>
              </div>

              <div className="mt-6">
                <ResourceList resources={selectedDataset.resources} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {selectedDataset && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={() => setSelectedDataset(null)}
        />
      )}
    </div>
  );
} 
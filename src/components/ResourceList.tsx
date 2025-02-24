'use client';

import { ArrowDownTrayIcon, TableCellsIcon, DocumentIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { Resource } from '@/lib/api';
import { useState, useMemo, useCallback, memo } from 'react';
import clsx from 'clsx';
import { DataViewer } from '@/components/DataViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

function formatBytes(bytes?: number) {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Memoized resource card component
const ResourceCard = memo(({ 
  resource, 
  onPreview 
}: { 
  resource: Resource;
  onPreview: (resource: Resource) => void;
}) => {
  const isPreviewable = resource.format.toLowerCase() === 'csv' && resource.datastore_active;
  const size = resource.size ? `${(resource.size / 1024 / 1024).toFixed(1)} MB` : 'N/A';

  return (
    <div className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {resource.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {resource.description || 'Sin descripción'}
          </p>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={e => e.stopPropagation()}
        >
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </a>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <DocumentIcon className="w-4 h-4" />
          <span>{resource.format}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {size}
        </div>
      </div>

      {isPreviewable && (
        <button
          onClick={() => onPreview(resource)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
        >
          <TableCellsIcon className="w-4 h-4" />
          <span>Previsualizar datos</span>
        </button>
      )}
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleClosePreview = useCallback(() => {
    setSelectedResource(null);
  }, []);

  const handlePreview = useCallback(async (resource: Resource) => {
    try {
      if (!resource.datastore_active) {
        alert('Este recurso no tiene datos activos para previsualizar');
        return;
      }
      
      // Verify datastore status
      const fields = await api.getResourceFields(resource.id);
      if (!fields || fields.length === 0) {
        resource.datastore_active = false; // Update UI to reflect reality
        alert('No se encontraron campos en el recurso');
        return;
      }
      
      setSelectedResource(resource);
    } catch (error: any) {
      console.error('Failed to verify datastore:', error);
      resource.datastore_active = false;
      
      const errorMessage = error.response?.data?.error?.message || error.message;
      alert(`Error al cargar los datos: ${errorMessage}`);
    }
  }, []);

  // Filter and deduplicate resources
  const uniqueResources = useMemo(() => {
    try {
      // First, group resources by their name (excluding format)
      const groups = resources.reduce<Record<string, Resource[]>>((acc, resource) => {
        const baseName = resource.name.replace(/\.(csv|json|xlsx?|xml)$/i, '');
        if (!acc[baseName]) {
          acc[baseName] = [];
        }
        acc[baseName].push(resource);
        return acc;
      }, {});

      // For each group, prefer CSV, then JSON, then others
      return Object.values(groups).map(group => {
        const csv = group.find(r => r.format.toLowerCase() === 'csv');
        const json = group.find(r => r.format.toLowerCase() === 'json');
        return csv || json || group[0];
      });
    } catch (error) {
      console.error('Error processing resources:', error);
      return resources; // Fallback to original list
    }
  }, [resources]);

  // Log resources to check datastore_active status
  console.log('Unique Resources:', uniqueResources.map(r => ({
    id: r.id,
    name: r.name,
    format: r.format,
    datastore_active: r.datastore_active
  })));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClosePreview]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recursos Disponibles ({uniqueResources.length})
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando versión preferida de cada recurso (CSV {'>'} JSON {'>'} otros)
          </p>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedResource && createPortal(
        <ErrorBoundary>
          <DataViewer
            resource={selectedResource}
            onClose={handleClosePreview}
          />
        </ErrorBoundary>,
        document.body
      )}
    </>
  );
} 
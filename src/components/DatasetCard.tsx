'use client';

import { CalendarIcon, DocumentIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Dataset } from '@/lib/api';
import { ResourceList } from './ResourceList';
import { useState } from 'react';
import clsx from 'clsx';

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {dataset.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {dataset.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date(dataset.metadata_created).toLocaleDateString('es')}</span>
          </div>
          <div className="flex items-center gap-1">
            <DocumentIcon className="w-4 h-4" />
            <span>{dataset.resources.length} recursos</span>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {dataset.organization.title}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-primary hover:text-primary/80"
        >
          <span>{expanded ? 'Ocultar recursos' : 'Ver recursos'}</span>
          <ChevronDownIcon className={clsx(
            'w-4 h-4 transition-transform',
            expanded && 'transform rotate-180'
          )} />
        </button>
      </div>

      <div className={clsx(
        'border-t transition-all overflow-hidden',
        expanded ? 'p-6' : 'h-0'
      )}>
        <ResourceList resources={dataset.resources} />
      </div>
    </div>
  );
} 
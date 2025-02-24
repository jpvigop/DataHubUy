'use client';

import { Suspense } from 'react';
import { HomeContent } from '@/components/HomeContent';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explorador de Datos Abiertos de Uruguay
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
} 
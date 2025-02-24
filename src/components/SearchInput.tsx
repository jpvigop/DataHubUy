'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  const handleSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder="Buscar datasets..."
        className="w-full p-4 pl-12 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
  );
} 
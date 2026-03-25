'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  initialQuery: string;
  onSearch: (value: string) => void;
}

export function SearchInput({ initialQuery, onSearch }: SearchInputProps) {
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      onSearch(value.trim());
    });
  };

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="relative block flex-1">
        <span className="sr-only">Buscar datasets</span>
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-12 py-3 text-base text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Buscar por nombre o descripcion"
          type="search"
          value={value}
        />
      </label>

      <button
        className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-80"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
}

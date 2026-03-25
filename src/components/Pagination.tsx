'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import {
  createCatalogHref,
  mergeCatalogQuery,
  type CatalogQueryState,
} from '@/lib/catalog-query';

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  query: CatalogQueryState;
  totalItems: number;
}

export function Pagination({
  currentPage,
  itemsPerPage,
  query,
  totalItems,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) =>
    createCatalogHref(
      mergeCatalogQuery(
        query,
        {
          page,
        },
        {
          clearDataset: true,
        }
      )
    );

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    if (totalPages <= 5) {
      return index + 1;
    }

    if (currentPage <= 3) {
      return index + 1;
    }

    if (currentPage >= totalPages - 2) {
      return totalPages - 4 + index;
    }

    return currentPage - 2 + index;
  });

  return (
    <nav
      aria-label="Paginacion de datasets"
      className="flex items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          aria-label="Pagina anterior"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
          href={createPageUrl(currentPage - 1)}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      )}

      {pages[0] > 1 && (
        <>
          <Link
            className="rounded-lg px-4 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
            href={createPageUrl(1)}
          >
            1
          </Link>
          {pages[0] > 2 && <span className="text-slate-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          aria-current={page === currentPage ? 'page' : undefined}
          className={
            page === currentPage
              ? 'rounded-lg bg-primary px-4 py-2 text-white'
              : 'rounded-lg px-4 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800'
          }
          href={createPageUrl(page)}
          key={page}
        >
          {page}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages - 1 && (
        <>
          <span className="text-slate-400">...</span>
          <Link
            className="rounded-lg px-4 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
            href={createPageUrl(totalPages)}
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          aria-label="Pagina siguiente"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
          href={createPageUrl(currentPage + 1)}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Link>
      )}
    </nav>
  );
}

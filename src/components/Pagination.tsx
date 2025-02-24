'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ currentPage, totalItems, itemsPerPage }: PaginationProps) {
  const pathname = usePathname();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <nav className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
      )}

      {pages[0] > 1 && (
        <>
          <Link
            href={createPageUrl(1)}
            className="px-4 py-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
          >
            1
          </Link>
          {pages[0] > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map(page => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'text-gray-500 hover:text-primary hover:bg-gray-100'
          }`}
        >
          {page}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages - 1 && (
        <>
          <span className="text-gray-400">...</span>
          <Link
            href={createPageUrl(totalPages)}
            className="px-4 py-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      )}
    </nav>
  );
} 
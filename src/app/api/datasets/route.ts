import { NextResponse } from 'next/server';

import { parseCatalogQuery } from '@/lib/catalog-query';
import { CkanError, fetchPackageSearch } from '@/lib/ckan';

function getErrorResponse(error: unknown) {
  if (error instanceof CkanError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
        },
        success: false,
      },
      {
        status: error.status,
      }
    );
  }

  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
      },
      success: false,
    },
    {
      status: 500,
    }
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseCatalogQuery(url.searchParams);
    const rawSort = url.searchParams.get('sort');
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    if (rawSort && rawSort.includes(' ')) {
      const [sort, direction] = rawSort.split(/\s+/, 2);
      query.sort = parseCatalogQuery(new URLSearchParams({ sort })).sort;
      query.direction = direction === 'asc' ? 'asc' : 'desc';
    }

    const response = await fetchPackageSearch(query, {
      limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
      offset: Number.isFinite(offset) && offset >= 0 ? offset : undefined,
    });
    return NextResponse.json(response);
  } catch (error) {
    return getErrorResponse(error);
  }
}

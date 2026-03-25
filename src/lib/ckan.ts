import 'server-only';

import {
  type CatalogQueryState,
  ITEMS_PER_PAGE,
} from '@/lib/catalog-query';
import type {
  CkanActionResponse,
  Dataset,
  DatastorePreviewResult,
  PackageSearchResult,
} from '@/lib/types';

const CKAN_BASE_URL = 'https://catalogodatos.gub.uy/api/3/action';
const JSON_HEADERS = {
  Accept: 'application/json',
};

export class CkanError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CkanError';
  }
}

function buildCkanUrl(
  action: string,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(`${CKAN_BASE_URL}/${action}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseActionResponse<T>(
  response: Response
): Promise<CkanActionResponse<T>> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    throw new CkanError(
      'The CKAN API returned a non-JSON response.',
      response.status
    );
  }

  if (!payload || typeof payload !== 'object') {
    throw new CkanError('The CKAN API returned an invalid payload.', response.status);
  }

  const actionPayload = payload as Partial<CkanActionResponse<T>> & {
    error?: { message?: string };
  };

  if (!response.ok || !actionPayload.success || actionPayload.result === undefined) {
    throw new CkanError(
      actionPayload.error?.message ||
        response.statusText ||
        'The CKAN API request failed.',
      response.status,
      payload
    );
  }

  return actionPayload as CkanActionResponse<T>;
}

async function fetchAction<T>(
  action: string,
  params: Record<string, string | number | undefined>,
  revalidate: number
): Promise<CkanActionResponse<T>> {
  const response = await fetch(buildCkanUrl(action, params), {
    headers: JSON_HEADERS,
    next: { revalidate },
  });

  return parseActionResponse<T>(response);
}

export async function fetchPackageSearch(
  query: CatalogQueryState,
  options: { limit?: number; offset?: number } = {}
): Promise<CkanActionResponse<PackageSearchResult>> {
  return fetchAction<PackageSearchResult>(
    'package_search',
    {
      rows: options.limit ?? ITEMS_PER_PAGE,
      sort: `${query.sort} ${query.direction}`,
      q: query.q || '*:*',
      start: options.offset ?? (query.page - 1) * ITEMS_PER_PAGE,
    },
    300
  );
}

export async function searchDatasets(query: CatalogQueryState): Promise<{
  datasets: Dataset[];
  total: number;
}> {
  const response = await fetchPackageSearch(query);

  return {
    datasets: response.result.results,
    total: response.result.count,
  };
}

export async function getDatasetDetails(id: string): Promise<Dataset> {
  const response = await fetchAction<Dataset>(
    'package_show',
    { id },
    900
  );

  return response.result;
}

function validateResourceId(resourceId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(resourceId)) {
    throw new CkanError('Invalid resource_id parameter.', 400);
  }

  return resourceId;
}

async function fetchDatastorePreview(
  resourceId: string,
  limit: number,
  offset: number
): Promise<DatastorePreviewResult> {
  const response = await fetchAction<DatastorePreviewResult>(
    'datastore_search',
    {
      resource_id: validateResourceId(resourceId),
      limit,
      offset,
    },
    120
  );

  return {
    fields: response.result.fields,
    records: response.result.records,
    total: response.result.total ?? response.result.records.length,
  };
}

export async function getDatastorePreview(
  resourceId: string,
  limit: number,
  offset: number
): Promise<DatastorePreviewResult> {
  const safeResourceId = validateResourceId(resourceId);

  try {
    const sqlResponse = await fetchAction<DatastorePreviewResult>(
      'datastore_search_sql',
      {
        sql: `SELECT * FROM "${safeResourceId}" LIMIT ${limit} OFFSET ${offset}`,
      },
      120
    );

    return {
      fields: sqlResponse.result.fields,
      records: sqlResponse.result.records,
      total: sqlResponse.result.total ?? sqlResponse.result.records.length,
    };
  } catch (error) {
    if (error instanceof CkanError && error.status < 500) {
      return fetchDatastorePreview(safeResourceId, limit, offset);
    }

    return fetchDatastorePreview(safeResourceId, limit, offset);
  }
}

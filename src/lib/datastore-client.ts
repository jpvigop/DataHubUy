import type { DatastorePreviewResult } from '@/lib/types';

interface DatastoreRouteResponse {
  success: boolean;
  result?: DatastorePreviewResult;
  error?: { message?: string };
}

export async function getResourcePreview(
  resourceId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<DatastorePreviewResult> {
  const params = new URLSearchParams({
    resource_id: resourceId,
    limit: String(options.limit ?? 100),
    offset: String(options.offset ?? 0),
  });

  const response = await fetch(`/api/datastore?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = (await response.json()) as DatastoreRouteResponse;

  if (!response.ok || !payload.success || !payload.result) {
    throw new Error(
      payload.error?.message || 'No se pudieron cargar los datos del recurso.'
    );
  }

  return payload.result;
}

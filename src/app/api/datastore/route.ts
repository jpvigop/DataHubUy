import { NextResponse } from 'next/server';

import { CkanError, getDatastorePreview } from '@/lib/ckan';

function parsePositiveInteger(value: string | null, fallback: number) {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new CkanError('Invalid numeric query parameter.', 400);
  }

  return Math.floor(parsed);
}

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
    const searchParams = new URL(request.url).searchParams;
    const resourceId = searchParams.get('resource_id');

    if (!resourceId) {
      throw new CkanError('Resource ID is required.', 400);
    }

    const limit = parsePositiveInteger(searchParams.get('limit'), 100);
    const offset = parsePositiveInteger(searchParams.get('offset'), 0);
    const result = await getDatastorePreview(resourceId, limit, offset);

    return NextResponse.json({
      result,
      success: true,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}

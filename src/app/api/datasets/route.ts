import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://catalogodatos.gub.uy/api/3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '*:*';
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const sort = searchParams.get('sort') || 'metadata_modified desc';

    // Validate parameters
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid limit parameter' } },
        { status: 400 }
      );
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid offset parameter' } },
        { status: 400 }
      );
    }

    console.log('Proxying request to CKAN API:', {
      query,
      limit: parsedLimit,
      offset: parsedOffset,
      sort
    });

    const response = await axios.get(`${BASE_URL}/action/package_search`, {
      params: {
        q: query,
        rows: parsedLimit,
        start: parsedOffset,
        sort: sort
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, error: { message: 'CKAN API request failed' } },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Dataset API error:', error.response?.data || error.message);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { success: false, error: { message: 'Request timeout' } },
          { status: 504 }
        );
      }

      if (error.response) {
        return NextResponse.json(
          { 
            success: false, 
            error: {
              message: error.response.data?.error?.message || error.message,
              status: error.response.status
            }
          },
          { status: error.response.status }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 
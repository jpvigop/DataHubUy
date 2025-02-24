import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://catalogodatos.gub.uy/api/3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resource_id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const fields = searchParams.get('fields');
    const filters = searchParams.get('filters');

    // Validate required parameters
    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: { message: 'Resource ID is required' } },
        { status: 400 }
      );
    }

    // Parse and validate numeric parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

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

    // First try SQL endpoint
    try {
      const sqlResponse = await axios.get(`${BASE_URL}/action/datastore_search_sql`, {
        params: {
          sql: `SELECT * FROM "${resourceId}" LIMIT ${parsedLimit} OFFSET ${parsedOffset}`
        },
        timeout: 10000 // 10 second timeout
      });

      if (sqlResponse.data.success) {
        // Format SQL response to match expected structure
        const formattedResponse = {
          success: true,
          result: {
            fields: sqlResponse.data.result.fields,
            records: sqlResponse.data.result.records,
            total: sqlResponse.data.result.total || sqlResponse.data.result.records.length
          }
        };
        return NextResponse.json(formattedResponse);
      }
    } catch (sqlError) {
      console.log('SQL endpoint failed, falling back to regular search');
    }

    // Fallback to regular search
    const response = await axios.get(`${BASE_URL}/action/datastore_search`, {
      params: {
        resource_id: resourceId,
        limit: parsedLimit,
        offset: parsedOffset,
        fields,
        filters: filters ? JSON.parse(filters) : undefined
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Datastore search failed' } },
        { status: response.status }
      );
    }

    // Format regular search response to match expected structure
    const formattedResponse = {
      success: true,
      result: {
        fields: response.data.result.fields,
        records: response.data.result.records,
        total: response.data.result.total || response.data.result.records.length
      }
    };
    return NextResponse.json(formattedResponse);
  } catch (error: any) {
    console.error('Datastore API error:', error.response?.data || error.message);

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
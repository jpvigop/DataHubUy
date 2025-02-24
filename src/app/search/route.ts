import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const datasets = await api.searchDatasets(query);
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search datasets' }, { status: 500 });
  }
} 
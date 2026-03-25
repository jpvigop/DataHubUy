import {
  CkanError,
  getDatastorePreview,
  searchDatasets,
} from '@/lib/ckan';

const datasetFixture = {
  description: 'Dataset de prueba',
  groups: [],
  id: 'dataset-1',
  metadata_created: '2024-01-01T00:00:00.000000',
  metadata_modified: '2024-01-02T00:00:00.000000',
  name: 'dataset-1',
  num_resources: 1,
  organization: {
    id: 'org-1',
    name: 'org-1',
    title: 'Organizacion',
  },
  resources: [
    {
      datastore_active: true,
      description: 'Recurso de prueba',
      format: 'CSV',
      id: 'resource-1',
      name: 'resource.csv',
      package_id: 'dataset-1',
      url: 'https://example.com/resource.csv',
    },
  ],
  tags: [],
  title: 'Dataset de prueba',
};

function createJsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
    ...init,
  });
}

describe('ckan client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns normalized search results', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createJsonResponse({
        help: 'ok',
        result: {
          count: 1,
          results: [datasetFixture],
        },
        success: true,
      })
    );

    const result = await searchDatasets({
      direction: 'desc',
      page: 1,
      q: 'prueba',
      sort: 'metadata_modified',
    });

    expect(result.total).toBe(1);
    expect(result.datasets[0]?.id).toBe('dataset-1');
  });

  it('falls back to datastore_search when the SQL endpoint fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            error: {
              message: 'SQL disabled',
            },
            success: false,
          },
          {
            status: 404,
          }
        )
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          help: 'ok',
          result: {
            fields: [{ id: 'name', type: 'text' }],
            records: [{ name: 'Ana' }],
            total: 1,
          },
          success: true,
        })
      );

    const result = await getDatastorePreview('resource_1', 100, 0);

    expect(result.total).toBe(1);
    expect(result.records[0]).toEqual({ name: 'Ana' });
  });

  it('throws a typed error for non-json responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('not-json', {
        status: 500,
      })
    );

    await expect(
      searchDatasets({
        direction: 'desc',
        page: 1,
        sort: 'metadata_modified',
      })
    ).rejects.toBeInstanceOf(CkanError);
  });
});

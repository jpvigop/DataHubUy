import {
  createCatalogHref,
  mergeCatalogQuery,
  parseCatalogQuery,
} from '@/lib/catalog-query';

describe('catalog-query', () => {
  it('normalizes invalid values and clears orphaned resources', () => {
    const query = parseCatalogQuery({
      direction: 'sideways',
      page: '0',
      resource: 'resource-1',
      sort: 'organization.title',
    });

    expect(query).toEqual({
      direction: 'desc',
      page: 1,
      sort: 'metadata_modified',
    });
  });

  it('builds stable catalog hrefs', () => {
    const href = createCatalogHref({
      dataset: 'dataset-1',
      direction: 'asc',
      page: 3,
      q: 'hospital',
      resource: 'resource-9',
      sort: 'title',
    });

    expect(href).toBe(
      '/?q=hospital&page=3&sort=title&direction=asc&dataset=dataset-1&resource=resource-9'
    );
  });

  it('resets page and clears selection when requested', () => {
    const nextQuery = mergeCatalogQuery(
      {
        dataset: 'dataset-1',
        direction: 'desc',
        page: 5,
        q: 'salud',
        resource: 'resource-1',
        sort: 'metadata_modified',
      },
      {
        q: 'egresos',
      },
      {
        clearDataset: true,
        resetPage: true,
      }
    );

    expect(nextQuery).toEqual({
      direction: 'desc',
      page: 1,
      q: 'egresos',
      sort: 'metadata_modified',
    });
  });
});

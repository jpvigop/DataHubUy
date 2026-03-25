export const ITEMS_PER_PAGE = 20;

export const CATALOG_SORT_FIELDS = [
  'title',
  'metadata_created',
  'metadata_modified',
  'num_resources',
] as const;

export type CatalogSortField = (typeof CATALOG_SORT_FIELDS)[number];
export type SortDirection = 'asc' | 'desc';

export interface CatalogQueryState {
  q?: string;
  page: number;
  sort: CatalogSortField;
  direction: SortDirection;
  dataset?: string;
  resource?: string;
}

type SearchParamValue = string | string[] | undefined;
type SearchParamRecord = Record<string, SearchParamValue>;
type SearchParamInput =
  | URLSearchParams
  | { get(name: string): string | null }
  | SearchParamRecord;

interface CatalogQueryInput {
  dataset?: string;
  direction?: SortDirection | string;
  page?: number | string;
  q?: string;
  resource?: string;
  sort?: CatalogSortField | string;
}

interface MergeCatalogQueryOptions {
  clearDataset?: boolean;
  clearResource?: boolean;
  resetPage?: boolean;
}

const DEFAULT_STATE: CatalogQueryState = {
  page: 1,
  sort: 'metadata_modified',
  direction: 'desc',
};

function getFirstValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function hasSearchParamGetter(
  input: SearchParamInput
): input is URLSearchParams | { get(name: string): string | null } {
  return typeof (input as { get?: unknown }).get === 'function';
}

function readParam(input: SearchParamInput, key: string): string | undefined {
  if (hasSearchParamGetter(input)) {
    return input.get(key) ?? undefined;
  }

  return getFirstValue((input as SearchParamRecord)[key]);
}

function normalizePage(value: string | number | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function normalizeSort(value: string | undefined): CatalogSortField {
  return CATALOG_SORT_FIELDS.includes(value as CatalogSortField)
    ? (value as CatalogSortField)
    : DEFAULT_STATE.sort;
}

function normalizeDirection(value: string | undefined): SortDirection {
  return value === 'asc' ? 'asc' : 'desc';
}

export function normalizeCatalogQuery(
  state: CatalogQueryInput
): CatalogQueryState {
  const q = state.q?.trim() || undefined;
  const dataset = state.dataset?.trim() || undefined;
  const resource = dataset ? state.resource?.trim() || undefined : undefined;

  return {
    q,
    page: normalizePage(state.page),
    sort: normalizeSort(state.sort),
    direction: normalizeDirection(state.direction),
    dataset,
    resource,
  };
}

export function parseCatalogQuery(input: SearchParamInput): CatalogQueryState {
  return normalizeCatalogQuery({
    q: readParam(input, 'q'),
    page: readParam(input, 'page'),
    sort: readParam(input, 'sort'),
    direction: readParam(input, 'direction'),
    dataset: readParam(input, 'dataset'),
    resource: readParam(input, 'resource'),
  });
}

export function mergeCatalogQuery(
  current: CatalogQueryState,
  patch: Partial<CatalogQueryState>,
  options: MergeCatalogQueryOptions = {}
): CatalogQueryState {
  const next = normalizeCatalogQuery({
    ...current,
    ...patch,
    page: options.resetPage ? 1 : patch.page ?? current.page,
  });

  if (options.clearDataset) {
    delete next.dataset;
    delete next.resource;
  } else if (options.clearResource) {
    delete next.resource;
  }

  if (!next.dataset) {
    delete next.resource;
  }

  return next;
}

export function createCatalogQueryString(state: CatalogQueryState): string {
  const params = new URLSearchParams();

  if (state.q) {
    params.set('q', state.q);
  }

  if (state.page > 1) {
    params.set('page', String(state.page));
  }

  if (state.sort !== DEFAULT_STATE.sort) {
    params.set('sort', state.sort);
  }

  if (state.direction !== DEFAULT_STATE.direction) {
    params.set('direction', state.direction);
  }

  if (state.dataset) {
    params.set('dataset', state.dataset);
  }

  if (state.resource) {
    params.set('resource', state.resource);
  }

  return params.toString();
}

export function createCatalogHref(state: CatalogQueryState): string {
  const queryString = createCatalogQueryString(state);
  return queryString ? `/?${queryString}` : '/';
}

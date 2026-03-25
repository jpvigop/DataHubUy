export interface Organization {
  id: string;
  name: string;
  title: string;
  description?: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  format: string;
  url: string;
  datastore_active: boolean;
  size?: number | null;
  last_modified?: string | null;
  mimetype?: string | null;
  cache_url?: string | null;
  package_id: string;
}

export interface Dataset {
  id: string;
  name: string;
  title: string;
  description: string;
  license_title?: string | null;
  metadata_created: string;
  metadata_modified: string;
  organization: Organization;
  resources: Resource[];
  tags: Array<{ name: string }>;
  groups: Array<{ name: string }>;
  num_resources: number;
}

export interface CkanActionResponse<T> {
  help: string;
  success: boolean;
  result: T;
}

export interface PackageSearchResult {
  count: number;
  results: Dataset[];
}

export interface DatastoreField {
  id: string;
  type: string;
}

export type DatastoreRecord = Record<string, unknown>;

export interface DatastorePreviewResult {
  fields: DatastoreField[];
  records: DatastoreRecord[];
  total: number;
}

export interface SavedDatasetRef {
  id: string;
  title: string;
  organization: string;
}

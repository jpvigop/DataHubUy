import axios from 'axios';

const BASE_URL = 'https://catalogodatos.gub.uy/api/3';
const LOCAL_API_URL = '/api';

// Simple in-memory cache with expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export interface Resource {
  id: string;
  name: string;
  description: string;
  format: string;
  url: string;
  datastore_active: boolean;
  size?: number;
  last_modified?: string;
  mimetype?: string;
  cache_url?: string;
  package_id: string;
}

export interface Dataset {
  id: string;
  name: string;
  title: string;
  description: string;
  license_title?: string;
  metadata_created: string;
  metadata_modified: string;
  organization: {
    id: string;
    name: string;
    title: string;
    description?: string;
  };
  resources: Resource[];
  tags: Array<{ name: string }>;
  groups: Array<{ name: string }>;
  num_resources: number;
}

interface ApiResponse<T> {
  help: string;
  success: boolean;
  result: T;
}

interface SearchResult {
  count: number;
  results: Dataset[];
}

interface DatastoreResponse {
  fields: Array<{ id: string; type: string }>;
  records: any[];
  total: number;
}

class ApiError extends Error {
  constructor(message: string, public response?: any) {
    super(message);
    this.name = 'ApiError';
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Validate API response
const validateApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    typeof response.success === 'boolean' &&
    'result' in response
  );
};

// Validate datastore response
const validateDatastoreResponse = (response: any): response is DatastoreResponse => {
  if (!response || typeof response !== 'object') {
    console.error('Invalid response format:', response);
    return false;
  }

  // Check fields array
  if (!Array.isArray(response.fields)) {
    console.error('Fields is not an array:', response.fields);
    return false;
  }

  // Validate each field has at least an id
  const validFields = response.fields.every((f: any) => 
    typeof f === 'object' && typeof f.id === 'string'
  );

  if (!validFields) {
    console.error('Invalid field format:', response.fields);
    return false;
  }

  // Check records array
  if (!Array.isArray(response.records)) {
    console.error('Records is not an array:', response.records);
    return false;
  }

  // Total can be undefined/null, will default to records length
  if (response.total !== undefined && typeof response.total !== 'number') {
    console.error('Total is not a number:', response.total);
    return false;
  }

  return true;
};

const getCacheKey = (endpoint: string, params: any) => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setInCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const api = {
  async searchDatasets(query?: string, options: { 
    limit?: number; 
    offset?: number;
    sort?: string;
  } = {}): Promise<{ datasets: Dataset[]; total: number }> {
    try {
      const cacheKey = getCacheKey('datasets', { query, ...options });
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached datasets');
        return cached;
      }

      console.log('API Request:', {
        query,
        options,
        url: `${LOCAL_API_URL}/datasets`
      });

      const response = await axios.get<ApiResponse<SearchResult>>(`${LOCAL_API_URL}/datasets`, {
        params: {
          q: query || '*:*',
          limit: options.limit || 10,
          offset: options.offset || 0,
          sort: options.sort || 'metadata_modified desc'
        }
      });

      if (!validateApiResponse<SearchResult>(response.data)) {
        throw new ApiError('Invalid API response format');
      }

      if (!response.data.success) {
        throw new ApiError('Search request failed', response.data);
      }

      const result = {
        datasets: response.data.result.results,
        total: response.data.result.count
      };

      setInCache(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.error?.message || 
          error.response?.statusText || 
          'Failed to search datasets',
          error
        );
      }

      throw error;
    }
  },

  async getDatasetDetails(id: string): Promise<Dataset> {
    try {
      console.log('Getting dataset details for:', id);
      const response = await axios.get<ApiResponse<Dataset>>(`${BASE_URL}/action/package_show`, {
        params: { id }
      });

      if (!response.data.success) {
        throw new ApiError('Dataset details request failed', response.data);
      }

      return response.data.result;
    } catch (error) {
      console.error('Error getting dataset details:', error);
      throw new ApiError('Failed to get dataset details', error);
    }
  },

  async getResourceData(resourceId: string, options: {
    limit?: number;
    offset?: number;
    fields?: string[];
    filters?: Record<string, any>;
  } = {}) {
    try {
      const cacheKey = getCacheKey(`resource:${resourceId}`, options);
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached resource data');
        return cached;
      }

      console.log('Getting resource data for:', resourceId, 'options:', options);
      
      const response = await axios.get<ApiResponse<DatastoreResponse>>(`${LOCAL_API_URL}/datastore`, {
        params: {
          resource_id: resourceId,
          limit: options.limit || 100,
          offset: options.offset || 0,
          fields: options.fields?.join(','),
          filters: options.filters ? JSON.stringify(options.filters) : undefined
        }
      });

      if (!validateApiResponse<DatastoreResponse>(response.data)) {
        throw new ApiError('Invalid API response format');
      }

      if (!response.data.success) {
        throw new ApiError('Resource data request failed', response.data);
      }

      if (!validateDatastoreResponse(response.data.result)) {
        throw new ApiError('Invalid datastore response format');
      }

      const result = response.data.result;
      setInCache(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Error getting resource data:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.error?.message || 
          error.response?.statusText || 
          'Failed to get resource data',
          error
        );
      }

      throw error;
    }
  },

  async getResourceFields(resourceId: string) {
    try {
      const cacheKey = `fields:${resourceId}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached fields');
        return cached;
      }

      console.log('Getting resource fields for:', resourceId);
      const response = await axios.get<ApiResponse<DatastoreResponse>>(`${LOCAL_API_URL}/datastore`, {
        params: {
          resource_id: resourceId,
          limit: 0
        }
      });

      if (!validateApiResponse<DatastoreResponse>(response.data)) {
        throw new ApiError('Invalid API response format');
      }

      if (!response.data.success) {
        throw new ApiError('Resource fields request failed', response.data);
      }

      if (!validateDatastoreResponse(response.data.result)) {
        throw new ApiError('Invalid datastore response format');
      }

      const result = response.data.result.fields;
      setInCache(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Error getting resource fields:', error);
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.error?.message || 
          error.response?.statusText || 
          'Failed to get resource fields',
          error
        );
      }
      throw error;
    }
  }
}; 
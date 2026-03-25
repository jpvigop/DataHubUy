'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Dataset, SavedDatasetRef } from '@/lib/types';

const STORAGE_KEY = 'datahubuy_saved_datasets';

function isSavedDatasetRef(value: unknown): value is SavedDatasetRef {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'id' in value &&
      'title' in value &&
      'organization' in value
  );
}

function toSavedDatasetRef(dataset: Pick<Dataset, 'id' | 'title' | 'organization'>) {
  return {
    id: dataset.id,
    title: dataset.title,
    organization: dataset.organization.title,
  };
}

export function useSavedDatasets() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetRef[]>([]);

  useEffect(() => {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      setHasHydrated(true);
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as unknown[];
      setSavedDatasets(parsedValue.filter(isSavedDatasetRef));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  const savedIds = useMemo(
    () => new Set(savedDatasets.map((dataset) => dataset.id)),
    [savedDatasets]
  );

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDatasets));
  }, [hasHydrated, savedDatasets]);

  const toggleSaved = (dataset: Pick<Dataset, 'id' | 'title' | 'organization'>) => {
    const savedDataset = toSavedDatasetRef(dataset);

    setSavedDatasets((currentValue) =>
      currentValue.some(({ id }) => id === savedDataset.id)
        ? currentValue.filter(({ id }) => id !== savedDataset.id)
        : [savedDataset, ...currentValue]
    );
  };

  const removeSaved = (datasetId: string) => {
    setSavedDatasets((currentValue) =>
      currentValue.filter(({ id }) => id !== datasetId)
    );
  };

  const isSaved = (datasetId: string) => savedIds.has(datasetId);

  return {
    isSaved,
    removeSaved,
    savedDatasets,
    toggleSaved,
  };
}

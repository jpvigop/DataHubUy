import { useState, useEffect } from 'react';
import type { Dataset } from '@/lib/api';

const STORAGE_KEY = 'urudat_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, Dataset>>({});

  useEffect(() => {
    // Load favorites from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (dataset: Dataset) => {
    setFavorites(prev => {
      const next = { ...prev };
      if (next[dataset.id]) {
        delete next[dataset.id];
      } else {
        next[dataset.id] = dataset;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (datasetId: string) => {
    return !!favorites[datasetId];
  };

  const getFavorites = () => Object.values(favorites);

  return {
    favorites: getFavorites(),
    toggleFavorite,
    isFavorite
  };
} 
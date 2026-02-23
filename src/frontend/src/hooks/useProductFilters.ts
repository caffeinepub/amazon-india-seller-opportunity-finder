import { useState, useEffect } from 'react';
import { AdvancedFilters } from '../backend';

const STORAGE_KEY = 'product-filters';

const defaultFilters: AdvancedFilters = {
  priceRange: undefined,
  ratingThreshold: undefined,
  reviewCountMax: undefined,
  bsrRange: undefined,
  monthlyRevenueRange: undefined,
  lightweightPreference: false,
  nonBrandedFriendly: false,
  lowFBACount: false,
  highReviewGrowth: false,
  highMarginThreshold: false,
};

export function useFilteredProducts() {
  const [filters, setFilters] = useState<AdvancedFilters>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to session storage:', error);
    }
  }, [filters]);

  const updateFilters = (updates: Partial<AdvancedFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

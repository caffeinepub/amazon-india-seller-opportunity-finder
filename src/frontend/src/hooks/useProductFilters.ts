import { useState, useEffect } from 'react';

export interface ProductFilters {
  category: string;
  subcategory: string;
  priceMin: string;
  priceMax: string;
  ratingThreshold: string;
  reviewCountMax: string;
  bsrMin: string;
  bsrMax: string;
  monthlyRevenueMin: string;
  monthlyRevenueMax: string;
  lightweightPreference: boolean;
  nonBrandedFriendly: boolean;
  lowFBACount: boolean;
  highReviewGrowth: boolean;
  highMarginThreshold: boolean;
}

const defaultFilters: ProductFilters = {
  category: '',
  subcategory: '',
  priceMin: '',
  priceMax: '',
  ratingThreshold: '',
  reviewCountMax: '',
  bsrMin: '',
  bsrMax: '',
  monthlyRevenueMin: '',
  monthlyRevenueMax: '',
  lightweightPreference: false,
  nonBrandedFriendly: false,
  lowFBACount: false,
  highReviewGrowth: false,
  highMarginThreshold: false,
};

// Helper to safely convert string to number, returns undefined if empty/invalid
function safeParseNumber(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

// Helper to safely convert string to bigint, returns undefined if empty/invalid
function safeParseBigInt(value: string): bigint | undefined {
  if (!value || value.trim() === '') return undefined;
  try {
    const num = Number(value);
    if (isNaN(num)) return undefined;
    return BigInt(Math.floor(num));
  } catch {
    return undefined;
  }
}

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const stored = sessionStorage.getItem('productFilters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure all numeric fields are strings
        return {
          ...defaultFilters,
          ...parsed,
          priceMin: String(parsed.priceMin || ''),
          priceMax: String(parsed.priceMax || ''),
          ratingThreshold: String(parsed.ratingThreshold || ''),
          reviewCountMax: String(parsed.reviewCountMax || ''),
          bsrMin: String(parsed.bsrMin || ''),
          bsrMax: String(parsed.bsrMax || ''),
          monthlyRevenueMin: String(parsed.monthlyRevenueMin || ''),
          monthlyRevenueMax: String(parsed.monthlyRevenueMax || ''),
        };
      } catch (e) {
        console.error('Failed to parse stored filters:', e);
        return defaultFilters;
      }
    }
    return defaultFilters;
  });

  useEffect(() => {
    console.log('💾 [useProductFilters] Saving filters to sessionStorage:', filters);
    sessionStorage.setItem('productFilters', JSON.stringify(filters));
  }, [filters]);

  const hasActiveFilters = 
    filters.category !== '' ||
    filters.subcategory !== '' ||
    filters.priceMin !== '' ||
    filters.priceMax !== '' ||
    filters.ratingThreshold !== '' ||
    filters.reviewCountMax !== '' ||
    filters.bsrMin !== '' ||
    filters.bsrMax !== '' ||
    filters.monthlyRevenueMin !== '' ||
    filters.monthlyRevenueMax !== '' ||
    filters.lightweightPreference ||
    filters.nonBrandedFriendly ||
    filters.lowFBACount ||
    filters.highReviewGrowth ||
    filters.highMarginThreshold;

  const getBackendFilters = () => {
    const priceMin = safeParseNumber(filters.priceMin);
    const priceMax = safeParseNumber(filters.priceMax);
    const bsrMin = safeParseBigInt(filters.bsrMin);
    const bsrMax = safeParseBigInt(filters.bsrMax);
    const revenueMin = safeParseNumber(filters.monthlyRevenueMin);
    const revenueMax = safeParseNumber(filters.monthlyRevenueMax);
    const reviewMax = safeParseBigInt(filters.reviewCountMax);
    const rating = safeParseNumber(filters.ratingThreshold);

    const backendFilters = {
      category: filters.category || undefined,
      subcategory: filters.subcategory || undefined,
      priceRange: priceMin !== undefined && priceMax !== undefined ? [priceMin, priceMax] as [number, number] : undefined,
      ratingThreshold: rating,
      reviewCountMax: reviewMax,
      bsrRange: bsrMin !== undefined && bsrMax !== undefined ? [bsrMin, bsrMax] as [bigint, bigint] : undefined,
      monthlyRevenueRange: revenueMin !== undefined && revenueMax !== undefined ? [revenueMin, revenueMax] as [number, number] : undefined,
      lightweightPreference: filters.lightweightPreference,
      nonBrandedFriendly: filters.nonBrandedFriendly,
      lowFBACount: filters.lowFBACount,
      highReviewGrowth: filters.highReviewGrowth,
      highMarginThreshold: filters.highMarginThreshold,
    };

    console.log('🔄 [useProductFilters] Converting to backend filters:', {
      frontend: filters,
      backend: {
        ...backendFilters,
        reviewCountMax: backendFilters.reviewCountMax?.toString(),
        bsrRange: backendFilters.bsrRange?.map(b => b.toString()),
      }
    });

    return backendFilters;
  };

  const resetFilters = () => {
    console.log('🔄 [useProductFilters] Resetting filters to default');
    setFilters(defaultFilters);
    sessionStorage.removeItem('productFilters');
  };

  return {
    filters,
    setFilters,
    hasActiveFilters,
    getBackendFilters,
    resetFilters,
  };
}

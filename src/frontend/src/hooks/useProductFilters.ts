import { useState, useEffect } from 'react';
import { ProductSearchFilters } from '../backend';

const STORAGE_KEY = 'product-filters';

const defaultFilters: ProductSearchFilters = {
  category: undefined,
  subcategory: undefined,
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

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductSearchFilters>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Convert reviewCountMax and bsrRange back to bigint if they exist
        if (parsed.reviewCountMax !== undefined && parsed.reviewCountMax !== null) {
          try {
            parsed.reviewCountMax = BigInt(parsed.reviewCountMax);
          } catch (e) {
            console.warn('⚠️ useProductFilters - Failed to parse reviewCountMax as bigint:', e);
            parsed.reviewCountMax = undefined;
          }
        }
        
        if (parsed.bsrRange && Array.isArray(parsed.bsrRange) && parsed.bsrRange.length === 2) {
          try {
            parsed.bsrRange = [BigInt(parsed.bsrRange[0]), BigInt(parsed.bsrRange[1])];
          } catch (e) {
            console.warn('⚠️ useProductFilters - Failed to parse bsrRange as bigint:', e);
            parsed.bsrRange = undefined;
          }
        }
        
        if (import.meta.env.DEV) {
          console.log('📂 useProductFilters - Loaded filters from session storage:', {
            category: parsed.category,
            subcategory: parsed.subcategory,
            priceRange: parsed.priceRange,
            ratingThreshold: parsed.ratingThreshold,
            reviewCountMax: parsed.reviewCountMax?.toString(),
            bsrRange: parsed.bsrRange ? [parsed.bsrRange[0].toString(), parsed.bsrRange[1].toString()] : undefined,
            monthlyRevenueRange: parsed.monthlyRevenueRange,
            booleanFilters: {
              lightweightPreference: parsed.lightweightPreference,
              nonBrandedFriendly: parsed.nonBrandedFriendly,
              lowFBACount: parsed.lowFBACount,
              highReviewGrowth: parsed.highReviewGrowth,
              highMarginThreshold: parsed.highMarginThreshold,
            },
          });
        }
        
        return parsed;
      }
      
      console.log('📂 useProductFilters - No stored filters, using defaults');
      return defaultFilters;
    } catch (error) {
      console.error('❌ useProductFilters - Failed to load filters from session storage:', error);
      return defaultFilters;
    }
  });

  useEffect(() => {
    try {
      // Convert bigint to string for JSON serialization
      const serializable = {
        ...filters,
        reviewCountMax: filters.reviewCountMax !== undefined ? filters.reviewCountMax.toString() : undefined,
        bsrRange: filters.bsrRange ? [filters.bsrRange[0].toString(), filters.bsrRange[1].toString()] : undefined,
      };
      
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      
      if (import.meta.env.DEV) {
        console.log('💾 useProductFilters - Saved filter state to session storage:', {
          category: filters.category,
          subcategory: filters.subcategory,
          priceRange: filters.priceRange,
          ratingThreshold: filters.ratingThreshold,
          reviewCountMax: filters.reviewCountMax?.toString(),
          bsrRange: filters.bsrRange ? [filters.bsrRange[0].toString(), filters.bsrRange[1].toString()] : undefined,
          monthlyRevenueRange: filters.monthlyRevenueRange,
          booleanFilters: {
            lightweightPreference: filters.lightweightPreference,
            nonBrandedFriendly: filters.nonBrandedFriendly,
            lowFBACount: filters.lowFBACount,
            highReviewGrowth: filters.highReviewGrowth,
            highMarginThreshold: filters.highMarginThreshold,
          },
        });
      }
    } catch (error) {
      console.error('❌ useProductFilters - Failed to save filters to session storage:', error);
    }
  }, [filters]);

  const updateFilters = (updates: Partial<ProductSearchFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updates };
      
      if (import.meta.env.DEV) {
        console.log('🔄 useProductFilters - Updating filters:', {
          updates: {
            ...updates,
            reviewCountMax: updates.reviewCountMax?.toString(),
            bsrRange: updates.bsrRange ? [updates.bsrRange[0].toString(), updates.bsrRange[1].toString()] : undefined,
          },
          previousState: {
            category: prev.category,
            subcategory: prev.subcategory,
            priceRange: prev.priceRange,
            ratingThreshold: prev.ratingThreshold,
            reviewCountMax: prev.reviewCountMax?.toString(),
            bsrRange: prev.bsrRange ? [prev.bsrRange[0].toString(), prev.bsrRange[1].toString()] : undefined,
          },
          newState: {
            category: newFilters.category,
            subcategory: newFilters.subcategory,
            priceRange: newFilters.priceRange,
            ratingThreshold: newFilters.ratingThreshold,
            reviewCountMax: newFilters.reviewCountMax?.toString(),
            bsrRange: newFilters.bsrRange ? [newFilters.bsrRange[0].toString(), newFilters.bsrRange[1].toString()] : undefined,
          },
        });
      }
      
      return newFilters;
    });
  };

  const resetFilters = () => {
    console.log('🔄 useProductFilters - Resetting all filters to default');
    setFilters(defaultFilters);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const hasActiveFilters = () => {
    const active = (
      filters.category !== undefined ||
      filters.subcategory !== undefined ||
      filters.priceRange !== undefined ||
      filters.ratingThreshold !== undefined ||
      filters.reviewCountMax !== undefined ||
      filters.bsrRange !== undefined ||
      filters.monthlyRevenueRange !== undefined ||
      filters.lightweightPreference ||
      filters.nonBrandedFriendly ||
      filters.lowFBACount ||
      filters.highReviewGrowth ||
      filters.highMarginThreshold
    );
    
    if (import.meta.env.DEV) {
      console.log('🔍 useProductFilters - hasActiveFilters check:', {
        result: active,
        activeFilters: {
          category: !!filters.category,
          subcategory: !!filters.subcategory,
          priceRange: !!filters.priceRange,
          ratingThreshold: filters.ratingThreshold !== undefined,
          reviewCountMax: filters.reviewCountMax !== undefined,
          bsrRange: !!filters.bsrRange,
          monthlyRevenueRange: !!filters.monthlyRevenueRange,
          lightweightPreference: filters.lightweightPreference,
          nonBrandedFriendly: filters.nonBrandedFriendly,
          lowFBACount: filters.lowFBACount,
          highReviewGrowth: filters.highReviewGrowth,
          highMarginThreshold: filters.highMarginThreshold,
        },
      });
    }
    
    return active;
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
  };
}

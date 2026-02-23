import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SellerType } from '../backend';
import type { Product, ProductSearchFilters, OpportunityScore, UserProfile } from '../backend';

export function useSearchProducts(filters: ProductSearchFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  // Create a serializable query key (convert BigInt to string for React Query)
  const serializableKey = JSON.stringify({
    category: filters.category,
    subcategory: filters.subcategory,
    priceRange: filters.priceRange,
    ratingThreshold: filters.ratingThreshold,
    reviewCountMax: filters.reviewCountMax?.toString(),
    bsrRange: filters.bsrRange ? [filters.bsrRange[0].toString(), filters.bsrRange[1].toString()] : undefined,
    monthlyRevenueRange: filters.monthlyRevenueRange,
    lightweightPreference: filters.lightweightPreference,
    nonBrandedFriendly: filters.nonBrandedFriendly,
    lowFBACount: filters.lowFBACount,
    highReviewGrowth: filters.highReviewGrowth,
    highMarginThreshold: filters.highMarginThreshold,
  });

  return useQuery<Product[]>({
    queryKey: ['products', serializableKey],
    queryFn: async () => {
      console.log('🔍 [useQueries] searchProducts query executing');
      console.log('🔍 [useQueries] Actor available:', !!actor);
      console.log('🔍 [useQueries] Actor fetching:', actorFetching);
      
      if (!actor) {
        console.error('❌ [useQueries] Actor not available');
        throw new Error('Actor not available');
      }

      // Validate and sanitize filters before sending to backend
      const sanitizedFilters: ProductSearchFilters = {
        category: filters.category,
        subcategory: filters.subcategory,
        lightweightPreference: filters.lightweightPreference,
        nonBrandedFriendly: filters.nonBrandedFriendly,
        lowFBACount: filters.lowFBACount,
        highReviewGrowth: filters.highReviewGrowth,
        highMarginThreshold: filters.highMarginThreshold,
      };

      // Validate and add numeric fields
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (!isNaN(min) && !isNaN(max) && min >= 0 && max >= min) {
          sanitizedFilters.priceRange = [Number(min), Number(max)];
        } else {
          console.warn('⚠️ [useQueries] Invalid priceRange, skipping:', filters.priceRange);
        }
      }

      if (filters.ratingThreshold !== undefined) {
        const rating = Number(filters.ratingThreshold);
        if (!isNaN(rating) && rating >= 0 && rating <= 5) {
          sanitizedFilters.ratingThreshold = rating;
        } else {
          console.warn('⚠️ [useQueries] Invalid ratingThreshold, skipping:', filters.ratingThreshold);
        }
      }

      if (filters.reviewCountMax !== undefined) {
        try {
          const reviewMax = BigInt(filters.reviewCountMax.toString());
          if (reviewMax >= 0n) {
            sanitizedFilters.reviewCountMax = reviewMax;
          } else {
            console.warn('⚠️ [useQueries] Invalid reviewCountMax (negative), skipping:', filters.reviewCountMax);
          }
        } catch (e) {
          console.warn('⚠️ [useQueries] Invalid reviewCountMax (conversion error), skipping:', filters.reviewCountMax);
        }
      }

      if (filters.bsrRange) {
        try {
          const [min, max] = filters.bsrRange;
          const bsrMin = BigInt(min.toString());
          const bsrMax = BigInt(max.toString());
          if (bsrMin >= 0n && bsrMax >= bsrMin) {
            sanitizedFilters.bsrRange = [bsrMin, bsrMax];
          } else {
            console.warn('⚠️ [useQueries] Invalid bsrRange, skipping:', filters.bsrRange);
          }
        } catch (e) {
          console.warn('⚠️ [useQueries] Invalid bsrRange (conversion error), skipping:', filters.bsrRange);
        }
      }

      if (filters.monthlyRevenueRange) {
        const [min, max] = filters.monthlyRevenueRange;
        if (!isNaN(min) && !isNaN(max) && min >= 0 && max >= min) {
          sanitizedFilters.monthlyRevenueRange = [Number(min), Number(max)];
        } else {
          console.warn('⚠️ [useQueries] Invalid monthlyRevenueRange, skipping:', filters.monthlyRevenueRange);
        }
      }

      console.log('📤 [useQueries] Query Parameters - Sending filters to backend:', {
        ...sanitizedFilters,
        reviewCountMax: sanitizedFilters.reviewCountMax?.toString(),
        bsrRange: sanitizedFilters.bsrRange?.map(b => b.toString()),
      });

      try {
        const result = await actor.searchProducts(sanitizedFilters);
        
        console.log('📥 [useQueries] Raw response from backend:', result);
        console.log('📥 [useQueries] Response type:', typeof result);
        console.log('📥 [useQueries] Response __kind__:', result.__kind__);

        if (result.__kind__ === 'error') {
          console.error('❌ [useQueries] Backend returned error:', result.error);
          throw new Error(`Backend error: ${result.error}`);
        }

        console.log('✅ [useQueries] Query Status: Success');
        console.log('✅ [useQueries] Products count:', result.success?.length || 0);
        
        if (result.success && result.success.length > 0) {
          // Log all products to verify data integrity
          result.success.forEach((product, index) => {
            console.log(`📦 [useQueries] Product ${index + 1}:`, {
              id: product.id,
              productName: product.productName,
              asin: product.asin,
              price: product.price,
              category: product.category,
              margin: product.margin,
              rating: product.rating,
              reviewCount: product.reviewCount.toString(),
              bsr: product.bsr.toString(),
            });
            
            // Validate critical fields
            if (!product.productName || product.productName.trim() === '') {
              console.error(`❌ [useQueries] Product ${product.id} has empty productName!`);
            }
            if (!product.asin || product.asin.length !== 10) {
              console.error(`❌ [useQueries] Product ${product.id} has invalid ASIN: ${product.asin}`);
            }
            if (!product.price || product.price <= 0) {
              console.error(`❌ [useQueries] Product ${product.id} has invalid price: ${product.price}`);
            }
          });
        } else {
          console.warn('⚠️ [useQueries] Backend returned empty array');
        }

        return result.success || [];
      } catch (error) {
        console.error('❌ [useQueries] Query Status: Error');
        console.error('❌ [useQueries] Exception during searchProducts call:', error);
        console.error('❌ [useQueries] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 0, // Always refetch when filters change
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(productId);
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

export function useGetOpportunityScore(productId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OpportunityScore>({
    queryKey: ['opportunityScore', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOpportunityScore(productId);
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

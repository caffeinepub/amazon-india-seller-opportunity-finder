import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product, UserProfile, OpportunityScore, ProductSearchFilters } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        console.log('👤 useGetCallerUserProfile - Fetching user profile');
        const profile = await actor.getCallerUserProfile();
        console.log('✅ useGetCallerUserProfile - Profile fetched:', { hasProfile: !!profile });
        return profile;
      } catch (error: any) {
        console.error('❌ useGetCallerUserProfile - Error:', {
          error,
          errorMessage: error?.message,
          errorType: error?.constructor?.name,
        });
        throw error;
      }
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
      
      try {
        console.log('💾 useSaveCallerUserProfile - Saving profile');
        await actor.saveCallerUserProfile(profile);
        console.log('✅ useSaveCallerUserProfile - Profile saved successfully');
      } catch (error: any) {
        console.error('❌ useSaveCallerUserProfile - Error:', {
          error,
          errorMessage: error?.message,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      console.log('📦 useGetAllProducts - Starting query:', {
        hasActor: !!actor,
        actorFetching,
        timestamp: new Date().toISOString(),
      });

      if (!actor) {
        console.error('❌ useGetAllProducts - Actor unavailable');
        throw new Error('Backend connection unavailable. Please refresh the page.');
      }
      
      try {
        console.log('🔄 useGetAllProducts - Calling backend getAllProducts()');
        const products = await actor.getAllProducts();
        
        console.log('✅ useGetAllProducts - Successfully fetched products:', {
          count: products.length,
          timestamp: new Date().toISOString(),
          sampleProduct: products[0] ? {
            id: products[0].id,
            title: products[0].title,
            category: products[0].category,
            price: products[0].price,
          } : null,
        });
        
        return products;
      } catch (error: any) {
        console.error('❌ useGetAllProducts - Error fetching products:', {
          error,
          errorMessage: error?.message,
          errorType: error?.constructor?.name,
          errorStack: error?.stack,
          timestamp: new Date().toISOString(),
        });
        
        // Provide more specific error messages
        if (error?.message?.includes('Unauthorized')) {
          throw new Error('Authentication required. Please log in to view products.');
        } else if (error?.message?.includes('not available')) {
          throw new Error('Backend connection failed. Please refresh the page.');
        } else {
          throw new Error(`Failed to load products: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useSearchProducts(filters: ProductSearchFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', filters],
    queryFn: async () => {
      // Log the filters being sent to backend
      const filtersSummary = {
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
      };

      console.log('🔍 useSearchProducts - Starting search:', {
        hasActor: !!actor,
        actorFetching,
        filters: filtersSummary,
        timestamp: new Date().toISOString(),
      });

      if (!actor) {
        console.error('❌ useSearchProducts - Actor unavailable:', {
          filtersUsed: filtersSummary,
        });
        throw new Error('Backend connection unavailable. Please refresh the page.');
      }

      try {
        console.log('🔄 useSearchProducts - Calling backend searchProducts()');
        const result = await actor.searchProducts(filters);
        
        console.log('📦 useSearchProducts - Backend response received:', {
          resultType: result.__kind__,
          hasSuccess: '__kind__' in result && result.__kind__ === 'success',
          hasError: '__kind__' in result && result.__kind__ === 'error',
          timestamp: new Date().toISOString(),
        });

        // Handle the ProductSearchResult variant type
        if (result.__kind__ === 'error') {
          const errorMessage = result.error;
          console.error('❌ useSearchProducts - Backend returned error:', {
            errorMessage,
            filtersUsed: filtersSummary,
            timestamp: new Date().toISOString(),
          });
          throw new Error(`Search failed: ${errorMessage}`);
        }

        if (result.__kind__ === 'success') {
          const products = result.success;
          console.log('✅ useSearchProducts - Search successful:', {
            productsCount: products.length,
            filtersUsed: filtersSummary,
            timestamp: new Date().toISOString(),
            sampleProduct: products[0] ? {
              id: products[0].id,
              title: products[0].title,
              category: products[0].category,
              price: products[0].price,
            } : null,
          });
          return products;
        }

        // Fallback for unexpected response format
        console.error('❌ useSearchProducts - Unexpected response format:', {
          result,
          resultKeys: Object.keys(result),
          resultType: typeof result,
          timestamp: new Date().toISOString(),
        });
        throw new Error('Unexpected response format from backend');

      } catch (error: any) {
        console.error('❌ useSearchProducts - Exception during search:', {
          error,
          errorMessage: error?.message,
          errorType: error?.constructor?.name,
          errorStack: error?.stack,
          filtersUsed: filtersSummary,
          timestamp: new Date().toISOString(),
        });
        
        // Provide more specific error messages
        if (error?.message?.includes('Unauthorized')) {
          throw new Error('Authentication required. Please log in to search products.');
        } else if (error?.message?.includes('not available')) {
          throw new Error('Backend connection failed. Please refresh the page.');
        } else if (error?.message?.includes('Search failed')) {
          throw error; // Already formatted
        } else {
          throw new Error(`Search failed: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}

export function useGetProduct(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        console.log('📦 useGetProduct - Fetching product:', { id });
        const product = await actor.getProduct(id);
        console.log('✅ useGetProduct - Product fetched successfully');
        return product;
      } catch (error: any) {
        console.error('❌ useGetProduct - Error:', {
          error,
          errorMessage: error?.message,
          productId: id,
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useGetOpportunityScore(productId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OpportunityScore>({
    queryKey: ['opportunityScore', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        console.log('📊 useGetOpportunityScore - Fetching score:', { productId });
        const score = await actor.getOpportunityScore(productId);
        console.log('✅ useGetOpportunityScore - Score fetched successfully');
        return score;
      } catch (error: any) {
        console.error('❌ useGetOpportunityScore - Error:', {
          error,
          errorMessage: error?.message,
          productId,
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SellerType } from '../backend';
import type { Product, ProductSearchFilters, OpportunityScore, UserProfile } from '../backend';

// Mock fallback products for testing
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'fallback-1',
    title: 'Fallback Wireless Headphones',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 199.99,
    mrp: 249.99,
    rating: 4.5,
    reviewCount: BigInt(1200),
    bsr: BigInt(800),
    estimatedMonthlySales: BigInt(500),
    brand: 'SoundCore',
    sellerType: SellerType.fba,
    availableStock: BigInt(300),
    margin: 0.25,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'fallback-2',
    title: 'Fallback Water Bottle',
    category: 'Home & Kitchen',
    subcategory: 'Drinkware',
    price: 29.99,
    mrp: 39.99,
    rating: 4.7,
    reviewCount: BigInt(900),
    bsr: BigInt(1500),
    estimatedMonthlySales: BigInt(800),
    brand: 'EcoSip',
    sellerType: SellerType.easyShip,
    availableStock: BigInt(450),
    margin: 0.32,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'fallback-3',
    title: 'Fallback Yoga Mat',
    category: 'Sports',
    subcategory: 'Yoga',
    price: 49.99,
    mrp: 59.99,
    rating: 4.6,
    reviewCount: BigInt(1100),
    bsr: BigInt(1000),
    estimatedMonthlySales: BigInt(650),
    brand: 'FlexFit',
    sellerType: SellerType.fba,
    availableStock: BigInt(200),
    margin: 0.28,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'fallback-4',
    title: 'Fallback Bluetooth Speaker',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 89.99,
    mrp: 119.99,
    rating: 4.4,
    reviewCount: BigInt(850),
    bsr: BigInt(900),
    estimatedMonthlySales: BigInt(400),
    brand: 'SoundWave',
    sellerType: SellerType.easyShip,
    availableStock: BigInt(250),
    margin: 0.27,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'fallback-5',
    title: 'Fallback Lunch Box',
    category: 'Home & Kitchen',
    subcategory: 'Food Storage',
    price: 34.99,
    mrp: 49.99,
    rating: 4.5,
    reviewCount: BigInt(700),
    bsr: BigInt(1400),
    estimatedMonthlySales: BigInt(600),
    brand: 'FreshKeep',
    sellerType: SellerType.fba,
    availableStock: BigInt(300),
    margin: 0.3,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
];

export function useSearchProducts(filters: ProductSearchFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  // Create a serializable query key (convert BigInt to string for React Query)
  const serializableKey = {
    ...filters,
    reviewCountMax: filters.reviewCountMax?.toString(),
    bsrRange: filters.bsrRange ? [filters.bsrRange[0].toString(), filters.bsrRange[1].toString()] : undefined,
  };

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

      // Ensure proper types for backend call
      const sanitizedFilters: ProductSearchFilters = {
        ...filters,
        reviewCountMax: filters.reviewCountMax !== undefined 
          ? BigInt(filters.reviewCountMax.toString())
          : undefined,
        bsrRange: filters.bsrRange 
          ? [BigInt(filters.bsrRange[0].toString()), BigInt(filters.bsrRange[1].toString())] as [bigint, bigint]
          : undefined,
        priceRange: filters.priceRange
          ? [Number(filters.priceRange[0]), Number(filters.priceRange[1])] as [number, number]
          : undefined,
        monthlyRevenueRange: filters.monthlyRevenueRange
          ? [Number(filters.monthlyRevenueRange[0]), Number(filters.monthlyRevenueRange[1])] as [number, number]
          : undefined,
        ratingThreshold: filters.ratingThreshold !== undefined
          ? Number(filters.ratingThreshold)
          : undefined,
      };

      console.log('📤 [useQueries] Sending filters to backend:', {
        ...sanitizedFilters,
        reviewCountMax: sanitizedFilters.reviewCountMax?.toString(),
        bsrRange: sanitizedFilters.bsrRange?.map(b => b.toString()),
      });

      try {
        const result = await actor.searchProducts(sanitizedFilters);
        
        console.log('📥 [useQueries] Raw response from backend:', result);
        console.log('📥 [useQueries] Response __kind__:', result.__kind__);

        if (result.__kind__ === 'error') {
          console.error('❌ [useQueries] Backend returned error:', result.error);
          console.warn('⚠️ [useQueries] Using fallback mock data due to error');
          return FALLBACK_PRODUCTS;
        }

        console.log('✅ [useQueries] Success response, products count:', result.success?.length || 0);
        
        if (result.success && result.success.length > 0) {
          console.log('📦 [useQueries] First product:', result.success[0]);
        } else {
          console.warn('⚠️ [useQueries] Backend returned empty array, using fallback data');
          return FALLBACK_PRODUCTS;
        }

        return result.success;
      } catch (error) {
        console.error('❌ [useQueries] Exception during searchProducts call:', error);
        console.error('❌ [useQueries] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.warn('⚠️ [useQueries] Using fallback mock data due to exception');
        return FALLBACK_PRODUCTS;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
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

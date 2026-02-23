import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product, UserProfile, OpportunityScore, AdvancedFilters } from '../backend';

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
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProduct(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(id);
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
      return actor.getOpportunityScore(productId);
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

export function useSearchProductsByCategory(category: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProductsByCategory(category);
    },
    enabled: !!actor && !actorFetching && !!category,
  });
}

export function useSearchProductsByFilters(filters: AdvancedFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'filters', filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProductsByFilters(filters);
    },
    enabled: !!actor && !actorFetching,
  });
}

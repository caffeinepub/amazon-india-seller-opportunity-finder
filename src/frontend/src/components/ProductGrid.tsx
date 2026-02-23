import React, { useEffect } from 'react';
import { useSearchProducts } from '../hooks/useQueries';
import { useProductFilters } from '../hooks/useProductFilters';
import ProductCard from './ProductCard';
import LoadingStates from './LoadingStates';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Product } from '../backend';

export default function ProductGrid() {
  const { getBackendFilters, resetFilters, hasActiveFilters, filters } = useProductFilters();
  const backendFilters = getBackendFilters();
  const query = useSearchProducts(backendFilters);

  // Log filter changes
  useEffect(() => {
    console.log('🎯 [ProductGrid] Filter Applied:', {
      hasActiveFilters,
      frontendFilters: filters,
      backendFilters: {
        ...backendFilters,
        reviewCountMax: backendFilters.reviewCountMax?.toString(),
        bsrRange: backendFilters.bsrRange?.map(b => b.toString()),
      }
    });
  }, [filters, hasActiveFilters]);

  // Log query state changes
  useEffect(() => {
    console.log('🎯 [ProductGrid] Query state changed:', {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      isSuccess: query.isSuccess,
      dataExists: !!query.data,
      productCount: Array.isArray(query.data) ? query.data.length : 0,
    });
  }, [query.isLoading, query.isFetching, query.isError, query.isSuccess, query.data]);

  // Extract products from query data
  let products: Product[] = [];
  
  if (query.data) {
    console.log('🔍 [ProductGrid] Extracting products from query.data');
    
    // Check if data has __kind__ discriminator (ProductSearchResult union type)
    if (typeof query.data === 'object' && '__kind__' in query.data) {
      console.log('🔍 [ProductGrid] Data has __kind__ field:', (query.data as any).__kind__);
      
      if ((query.data as any).__kind__ === 'success') {
        products = (query.data as any).success || [];
        console.log('✅ [ProductGrid] Extracted from success variant, count:', products.length);
      } else if ((query.data as any).__kind__ === 'error') {
        console.error('❌ [ProductGrid] Data is error variant:', (query.data as any).error);
      }
    } else if (Array.isArray(query.data)) {
      // Direct array response
      products = query.data;
      console.log('✅ [ProductGrid] Data is direct array, count:', products.length);
    } else {
      console.warn('⚠️ [ProductGrid] Unexpected data structure:', query.data);
    }
  }

  console.log('🎯 [ProductGrid] Product count before/after filtering:', {
    before: 'N/A (backend filtered)',
    after: products.length,
  });

  if (query.isLoading) {
    console.log('⏳ [ProductGrid] Query Status: Loading');
    return <LoadingStates />;
  }

  if (query.error) {
    console.log('❌ [ProductGrid] Query Status: Error');
    console.error('❌ [ProductGrid] Error details:', query.error);
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2">Error Loading Products</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm">
              {query.error instanceof Error ? query.error.message : 'An unexpected error occurred'}
            </p>
            
            {hasActiveFilters && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Troubleshooting steps:</p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                  <li>Clear all filters and try again</li>
                  <li>Refresh the page to reset the application state</li>
                  <li>Avoid using extremely large numbers in filter inputs</li>
                </ul>
              </div>
            )}

            {hasActiveFilters && (
              <div className="mt-3 p-3 bg-background/50 rounded-md border">
                <p className="font-semibold text-sm mb-2">Active filters:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {filters.category && <li>Category: {filters.category}</li>}
                  {filters.priceMin && filters.priceMax && <li>Price: ₹{filters.priceMin} - ₹{filters.priceMax}</li>}
                  {filters.ratingThreshold && <li>Rating: {filters.ratingThreshold}+</li>}
                  {filters.reviewCountMax && <li>Max Reviews: {filters.reviewCountMax}</li>}
                  {filters.bsrMin && filters.bsrMax && <li>BSR: {filters.bsrMin} - {filters.bsrMax}</li>}
                  {filters.monthlyRevenueMin && filters.monthlyRevenueMax && <li>Revenue: ₹{filters.monthlyRevenueMin} - ₹{filters.monthlyRevenueMax}</li>}
                  {filters.highReviewGrowth && <li>High review growth enabled</li>}
                  {filters.highMarginThreshold && <li>High margin threshold (30%+) enabled</li>}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => query.refetch()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log('📭 [ProductGrid] Query Status: Success (Empty)');
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="max-w-md space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">No Products Found</h3>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'No products are currently available.'}
          </p>
          {hasActiveFilters && (
            <Button onClick={resetFilters} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  console.log('✅ [ProductGrid] Query Status: Success');
  console.log('✅ [ProductGrid] Rendering products grid with', products.length, 'products');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <Button onClick={resetFilters} variant="ghost" size="sm" className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

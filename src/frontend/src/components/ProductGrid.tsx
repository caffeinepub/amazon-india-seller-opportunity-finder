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

  console.log('🎯 [ProductGrid] Final product count:', products.length);
  
  // Validate products before rendering
  if (products.length > 0) {
    console.log('🔍 [ProductGrid] Validating products before render...');
    products.forEach((product, index) => {
      const isValid = product.productName && product.asin && product.price > 0;
      if (!isValid) {
        console.error(`❌ [ProductGrid] Invalid product at index ${index}:`, {
          id: product.id,
          productName: product.productName,
          asin: product.asin,
          price: product.price,
        });
      }
    });
  }

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
          <AlertDescription className="space-y-3">
            <p className="text-sm">
              {query.error instanceof Error ? query.error.message : 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => query.refetch()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (products.length === 0) {
    console.log('📭 [ProductGrid] No products to display');
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Alert className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2">No Products Found</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm">
              {hasActiveFilters
                ? 'No products match your current filters. Try adjusting your search criteria.'
                : 'No products available at the moment.'}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  console.log('🔄 [ProductGrid] Clearing all filters');
                  resetFilters();
                }}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('✅ [ProductGrid] Rendering grid with', products.length, 'products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {hasActiveFilters ? 'Filtered Results' : 'All Products'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={() => {
              console.log('🔄 [ProductGrid] Clearing all filters from header');
              resetFilters();
            }}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

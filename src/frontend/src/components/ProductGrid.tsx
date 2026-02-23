import React from 'react';
import { useSearchProducts } from '../hooks/useQueries';
import { useProductFilters } from '../hooks/useProductFilters';
import ProductCard from './ProductCard';
import LoadingStates from './LoadingStates';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SellerType } from '../backend';
import type { Product } from '../backend';

// TEST MODE - Set to true to bypass backend and use hardcoded data
const TEST_MODE = false;

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'test-1',
    title: 'Test Wireless Headphones',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 199.99,
    mrp: 249.99,
    rating: 4.5,
    reviewCount: BigInt(1200),
    bsr: BigInt(800),
    estimatedMonthlySales: BigInt(500),
    brand: 'TestBrand',
    sellerType: SellerType.fba,
    availableStock: BigInt(300),
    margin: 0.25,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'test-2',
    title: 'Test Water Bottle',
    category: 'Home & Kitchen',
    subcategory: 'Drinkware',
    price: 29.99,
    mrp: 39.99,
    rating: 4.7,
    reviewCount: BigInt(900),
    bsr: BigInt(1500),
    estimatedMonthlySales: BigInt(800),
    brand: 'TestBrand',
    sellerType: SellerType.easyShip,
    availableStock: BigInt(450),
    margin: 0.32,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
  {
    id: 'test-3',
    title: 'Test Yoga Mat',
    category: 'Sports',
    subcategory: 'Yoga',
    price: 49.99,
    mrp: 59.99,
    rating: 4.6,
    reviewCount: BigInt(1100),
    bsr: BigInt(1000),
    estimatedMonthlySales: BigInt(650),
    brand: 'TestBrand',
    sellerType: SellerType.fba,
    availableStock: BigInt(200),
    margin: 0.28,
    lastModified: BigInt(Date.now() * 1000000),
    images: [],
  },
];

export default function ProductGrid() {
  const { getBackendFilters, resetFilters, hasActiveFilters, filters } = useProductFilters();
  const backendFilters = getBackendFilters();
  const query = useSearchProducts(backendFilters);

  // Comprehensive logging
  console.log('🎯 [ProductGrid] Component render');
  console.log('🎯 [ProductGrid] Query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    dataExists: !!query.data,
  });
  console.log('🎯 [ProductGrid] Query data:', query.data);
  console.log('🎯 [ProductGrid] Query error:', query.error);
  
  if (query.data) {
    console.log('🎯 [ProductGrid] Data type:', typeof query.data);
    console.log('🎯 [ProductGrid] Is array:', Array.isArray(query.data));
    console.log('🎯 [ProductGrid] Data length:', Array.isArray(query.data) ? query.data.length : 'N/A');
    if (Array.isArray(query.data) && query.data.length > 0) {
      console.log('🎯 [ProductGrid] First product:', query.data[0]);
    }
  }

  // TEST MODE: Use hardcoded data
  if (TEST_MODE) {
    console.log('⚠️ [ProductGrid] TEST MODE ACTIVE - Using mock data');
    return (
      <div className="space-y-4">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Test Mode Active</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Displaying hardcoded test data. Set TEST_MODE to false to use real backend data.
          </AlertDescription>
        </Alert>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {MOCK_PRODUCTS.length} test product{MOCK_PRODUCTS.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  }

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
        query.error = new Error((query.data as any).error);
      }
    } else if (Array.isArray(query.data)) {
      // Direct array response
      products = query.data;
      console.log('✅ [ProductGrid] Data is direct array, count:', products.length);
    } else {
      console.warn('⚠️ [ProductGrid] Unexpected data structure:', query.data);
    }
  }

  console.log('🎯 [ProductGrid] Final products array length:', products.length);

  if (query.isLoading) {
    console.log('⏳ [ProductGrid] Rendering loading state');
    return <LoadingStates />;
  }

  if (query.error) {
    console.log('❌ [ProductGrid] Rendering error state');
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
                  {filters.highMarginThreshold && <li>High margin threshold enabled</li>}
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
    console.log('📭 [ProductGrid] Rendering empty state');
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

  console.log('✅ [ProductGrid] Rendering products grid with', products.length, 'products');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

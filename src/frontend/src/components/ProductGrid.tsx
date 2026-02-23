import { useState } from 'react';
import { Product } from '../backend';
import ProductCard from './ProductCard';
import ProductSortControls from './ProductSortControls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useProductFilters } from '../hooks/useProductFilters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export default function ProductGrid({ products, isLoading = false, error = null, onRetry }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'competition' | 'growth'>('score');
  const { filters, hasActiveFilters } = useProductFilters();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Log rendering state
  if (import.meta.env.DEV) {
    console.log('🎨 ProductGrid render:', {
      productsCount: products.length,
      isLoading,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle error state with detailed information and recovery options
  if (error) {
    const errorDetails = {
      message: error.message,
      type: error.constructor?.name || 'Error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      activeFilters: {
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
      },
    };

    console.error('❌ ProductGrid - Displaying error state:', errorDetails);

    // Determine error type and provide specific guidance
    const isAuthError = error.message.includes('Authentication') || error.message.includes('Unauthorized');
    const isConnectionError = error.message.includes('connection') || error.message.includes('not available');
    const isBackendError = error.message.includes('Search failed') || error.message.includes('Backend');

    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">Error Loading Products</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="font-medium text-base">{error.message}</p>
            
            {/* Specific troubleshooting steps based on error type */}
            <div className="space-y-2">
              <p className="font-semibold text-sm">Troubleshooting steps:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {isAuthError && (
                  <>
                    <li>Try logging out and logging back in</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Ensure you have the necessary permissions</li>
                  </>
                )}
                {isConnectionError && (
                  <>
                    <li>Check your internet connection</li>
                    <li>Refresh the page to reconnect to the backend</li>
                    <li>Try again in a few moments</li>
                  </>
                )}
                {isBackendError && (
                  <>
                    <li>Try adjusting your filter criteria</li>
                    <li>Reset all filters and try again</li>
                    <li>Contact support if the issue persists</li>
                  </>
                )}
                {!isAuthError && !isConnectionError && !isBackendError && (
                  <>
                    <li>Refresh the page and try again</li>
                    <li>Clear your browser cache</li>
                    <li>Check the browser console (F12) for more details</li>
                  </>
                )}
              </ul>
            </div>

            {/* Retry button */}
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}

            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="mt-3 p-3 bg-background/50 rounded-md border">
                <p className="font-semibold text-sm mb-2">Active filters:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {filters.category && <li>Category: {filters.category}</li>}
                  {filters.subcategory && <li>Subcategory: {filters.subcategory}</li>}
                  {filters.priceRange && <li>Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</li>}
                  {filters.ratingThreshold && <li>Rating: {filters.ratingThreshold}+</li>}
                  {filters.reviewCountMax && <li>Max Reviews: {filters.reviewCountMax.toString()}</li>}
                  {filters.bsrRange && <li>BSR: {filters.bsrRange[0].toString()} - {filters.bsrRange[1].toString()}</li>}
                  {filters.monthlyRevenueRange && <li>Revenue: ₹{filters.monthlyRevenueRange[0]} - ₹{filters.monthlyRevenueRange[1]}</li>}
                  {filters.lightweightPreference && <li>Lightweight preference enabled</li>}
                  {filters.nonBrandedFriendly && <li>Non-branded friendly enabled</li>}
                  {filters.lowFBACount && <li>Low FBA count enabled</li>}
                  {filters.highReviewGrowth && <li>High review growth enabled</li>}
                  {filters.highMarginThreshold && <li>High margin threshold enabled</li>}
                </ul>
              </div>
            )}

            {/* Technical details collapsible */}
            <Collapsible open={showTechnicalDetails} onOpenChange={setShowTechnicalDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
                  <span className="text-xs">Technical Details</span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-3 bg-background/50 rounded-md border text-xs font-mono space-y-2">
                  <div>
                    <span className="font-semibold">Error Type:</span> {errorDetails.type}
                  </div>
                  <div>
                    <span className="font-semibold">Timestamp:</span> {errorDetails.timestamp}
                  </div>
                  {errorDetails.stack && (
                    <div>
                      <span className="font-semibold">Stack Trace:</span>
                      <pre className="mt-1 text-[10px] overflow-x-auto whitespace-pre-wrap break-words">
                        {errorDetails.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <p className="text-xs mt-3 opacity-70">
              💡 Tip: Open the browser console (F12) for detailed debugging information
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Products are already filtered by the backend via useSearchProducts
  let sortedProducts: Product[] = [];
  
  try {
    sortedProducts = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return (b.price * Number(b.estimatedMonthlySales)) - (a.price * Number(a.estimatedMonthlySales));
        case 'competition':
          return Number(a.reviewCount) - Number(b.reviewCount);
        case 'growth':
          return Number(b.estimatedMonthlySales) - Number(a.estimatedMonthlySales);
        default:
          return b.margin - a.margin;
      }
    });

    if (import.meta.env.DEV) {
      console.log('✅ ProductGrid - Products sorted:', {
        sortBy,
        count: sortedProducts.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (sortError: any) {
    console.error('❌ ProductGrid - Error sorting products:', {
      sortError,
      errorMessage: sortError?.message,
      productsCount: products.length,
      sortBy,
      timestamp: new Date().toISOString(),
    });
    // Fallback to unsorted products
    sortedProducts = products;
  }

  if (isLoading) {
    console.log('⏳ ProductGrid - Showing loading state');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    console.log('ℹ️ ProductGrid - No products to display');
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No products found matching your filters. Try adjusting your filter criteria or reset filters to see all products.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
        </p>
        <ProductSortControls sortBy={sortBy} onSortChange={setSortBy} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

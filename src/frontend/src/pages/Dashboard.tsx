import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryFilter from '../components/CategoryFilter';
import AdvancedFilters from '../components/AdvancedFilters';
import ProductGrid from '../components/ProductGrid';
import OpportunityLeaderboard from '../components/OpportunityLeaderboard';
import CategoryHeatmap from '../components/CategoryHeatmap';
import KeywordResearch from '../components/KeywordResearch';
import ProfitCalculator from '../components/ProfitCalculator';
import { useGetAllProducts, useSearchProducts } from '../hooks/useQueries';
import { useProductFilters } from '../hooks/useProductFilters';
import { Search, Filter, TrendingUp } from 'lucide-react';
import LoadingStates from '../components/LoadingStates';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { filters, hasActiveFilters } = useProductFilters();
  
  // Merge category selection with filters
  const searchFilters = {
    ...filters,
    category: selectedCategory || filters.category,
  };

  // Use search when filters are active, otherwise get all products
  const { 
    data: allProducts, 
    isLoading: isLoadingAll, 
    error: errorAll,
    refetch: refetchAll 
  } = useGetAllProducts();
  
  const { 
    data: filteredProducts, 
    isLoading: isLoadingFiltered, 
    error: errorFiltered,
    refetch: refetchFiltered 
  } = useSearchProducts(searchFilters);

  // Determine which data to use
  const shouldUseFiltered = hasActiveFilters || selectedCategory;
  const products = shouldUseFiltered ? filteredProducts : allProducts;
  const isLoading = shouldUseFiltered ? isLoadingFiltered : isLoadingAll;
  const error = shouldUseFiltered ? errorFiltered : errorAll;
  const refetch = shouldUseFiltered ? refetchFiltered : refetchAll;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('📊 Dashboard state update:', {
        hasActiveFilters,
        selectedCategory,
        shouldUseFiltered,
        searchFilters: {
          category: searchFilters.category,
          subcategory: searchFilters.subcategory,
          priceRange: searchFilters.priceRange,
          ratingThreshold: searchFilters.ratingThreshold,
          reviewCountMax: searchFilters.reviewCountMax?.toString(),
          bsrRange: searchFilters.bsrRange ? [searchFilters.bsrRange[0].toString(), searchFilters.bsrRange[1].toString()] : undefined,
          monthlyRevenueRange: searchFilters.monthlyRevenueRange,
          booleanFilters: {
            lightweightPreference: searchFilters.lightweightPreference,
            nonBrandedFriendly: searchFilters.nonBrandedFriendly,
            lowFBACount: searchFilters.lowFBACount,
            highReviewGrowth: searchFilters.highReviewGrowth,
            highMarginThreshold: searchFilters.highMarginThreshold,
          },
        },
        productsCount: products?.length || 0,
        isLoading,
        hasError: !!error,
        errorMessage: error?.message,
        allProductsCount: allProducts?.length || 0,
        filteredProductsCount: filteredProducts?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }
  }, [hasActiveFilters, selectedCategory, shouldUseFiltered, products, isLoading, error, allProducts, filteredProducts, searchFilters]);

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/hero-dashboard.dim_1920x1080.png)' }}
        />
        <div className="relative container py-24 flex flex-col items-center justify-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight">
              Discover High-Opportunity Products on Amazon India
            </h1>
            <p className="text-xl text-muted-foreground">
              Find high-demand, low-competition, high-margin products across all Amazon.in categories.
              Make data-driven decisions with our proprietary opportunity scoring algorithm.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Get Started
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card">
              <Search className="h-12 w-12 text-chart-1" />
              <h3 className="font-semibold text-lg">Smart Search</h3>
              <p className="text-sm text-muted-foreground text-center">
                Advanced filters to find exactly what you need
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card">
              <TrendingUp className="h-12 w-12 text-chart-2" />
              <h3 className="font-semibold text-lg">Opportunity Score</h3>
              <p className="text-sm text-muted-foreground text-center">
                Proprietary algorithm to identify best opportunities
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card">
              <Filter className="h-12 w-12 text-chart-3" />
              <h3 className="font-semibold text-lg">Profit Calculator</h3>
              <p className="text-sm text-muted-foreground text-center">
                India-specific calculations with GST and fees
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Discover high-opportunity products across Amazon India
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <AdvancedFilters />
            </div>
            <div className="lg:col-span-3">
              {isLoading ? (
                <LoadingStates />
              ) : (
                <ProductGrid 
                  products={products || []} 
                  isLoading={isLoading}
                  error={error || null}
                  onRetry={() => refetch()}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <KeywordResearch />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <ProfitCalculator />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryHeatmap />
            <OpportunityLeaderboard products={allProducts || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

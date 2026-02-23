import { useProductFilters } from '../hooks/useProductFilters';
import CategoryFilter from '../components/CategoryFilter';
import AdvancedFilters from '../components/AdvancedFilters';
import ProductGrid from '../components/ProductGrid';

export default function Dashboard() {
  const { filters, setFilters } = useProductFilters();

  const handleCategoryChange = (category: string) => {
    console.log('📂 [Dashboard] Category changed to:', category);
    setFilters({
      ...filters,
      category,
      subcategory: '',
    });
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('🔧 [Dashboard] Filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleApply = () => {
    console.log('✅ [Dashboard] Apply triggered - filters already updated via setFilters');
    // No additional action needed - setFilters already triggers re-render and query refetch
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Amazon India Product Opportunity Finder</h1>
          <p className="text-muted-foreground">
            Discover high-potential products with low competition and strong demand
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <CategoryFilter
              selectedCategory={filters.category}
              onCategoryChange={handleCategoryChange}
            />
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApply}
            />
          </aside>

          <main className="lg:col-span-3">
            <ProductGrid />
          </main>
        </div>
      </div>
    </div>
  );
}

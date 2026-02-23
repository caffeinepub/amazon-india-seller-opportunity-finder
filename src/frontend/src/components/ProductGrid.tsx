import { useState } from 'react';
import { Product } from '../backend';
import ProductCard from './ProductCard';
import ProductSortControls from './ProductSortControls';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
}

export default function ProductGrid({ products, selectedCategory }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'competition' | 'growth'>('score');

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  if (filteredProducts.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No products found. {selectedCategory ? 'Try selecting a different category or ' : ''}
          Contact admin to add products to the database.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <ProductSortControls sortBy={sortBy} onSortChange={setSortBy} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

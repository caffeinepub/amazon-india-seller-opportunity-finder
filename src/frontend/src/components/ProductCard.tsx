import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Package } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import type { Product } from '../backend';
import { useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Debug logging to verify product data
  useEffect(() => {
    console.log('🏷️ [ProductCard] Rendering product:', {
      id: product.id,
      productName: product.productName,
      asin: product.asin,
      price: product.price,
      category: product.category,
      margin: product.margin,
    });
  }, [product]);

  const monthlyRevenue = product.price * Number(product.estimatedMonthlySales);
  
  // Convert margin from decimal to percentage (e.g., 0.25 -> 25%)
  const marginPercentage = (product.margin * 100).toFixed(1);

  const getOpportunityLevel = (margin: number): { label: string; color: string } => {
    const marginPercent = margin * 100;
    if (marginPercent >= 30) return { label: 'High', color: 'bg-green-500' };
    if (marginPercent >= 20) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-red-500' };
  };

  const opportunity = getOpportunityLevel(product.margin);

  // Validate critical fields
  const hasValidData = product.productName && product.asin && product.price > 0;
  
  if (!hasValidData) {
    console.error('❌ [ProductCard] Invalid product data:', product);
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">
            {product.productName || 'Unknown Product'}
          </CardTitle>
          <Badge className={`${opportunity.color} text-white shrink-0`}>
            {opportunity.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{product.category} • {product.subcategory}</span>
        </div>
        <div className="mt-2 p-2 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">ASIN:</span>
            <span className="text-sm font-mono font-bold text-foreground tracking-wide">
              {product.asin || 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Sales/mo</p>
            <p className="text-lg font-bold">{formatNumber(Number(product.estimatedMonthlySales))}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-sm font-semibold">{formatCurrency(monthlyRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Margin</p>
            <p className="text-sm font-semibold">{marginPercentage}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({formatNumber(Number(product.reviewCount))} reviews)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>BSR: {formatNumber(Number(product.bsr))}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span className="capitalize">{product.sellerType}</span>
          </div>
        </div>

        <Button className="w-full" variant="outline">
          Analyze
        </Button>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Package } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{product.productName}</CardTitle>
          <Badge className={`${opportunity.color} text-white shrink-0`}>
            {opportunity.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{product.category} • {product.subcategory}</span>
        </div>
        {product.asin && (
          <div className="mt-1">
            <span className="text-xs font-medium text-muted-foreground">ASIN: </span>
            <span className="text-xs font-mono font-semibold text-foreground">{product.asin}</span>
          </div>
        )}
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

import { Product } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface OpportunityLeaderboardProps {
  products: Product[];
}

export default function OpportunityLeaderboard({ products }: OpportunityLeaderboardProps) {
  const topProducts = [...products]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/opportunity-meter.dim_256x256.png"
            alt="Opportunity"
            className="h-6 w-6"
          />
          <CardTitle>Top Opportunities</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground">{product.margin.toFixed(1)}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

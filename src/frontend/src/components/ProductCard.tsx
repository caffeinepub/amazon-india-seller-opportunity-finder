import { Product } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { TrendingUp, Star, Package } from 'lucide-react';
import OpportunityScoreMeter from './OpportunityScoreMeter';
import RecommendationBadge from './RecommendationBadge';
import { formatCurrency } from '../utils/formatters';
import { useGetOpportunityScore } from '../hooks/useQueries';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { data: opportunityScore } = useGetOpportunityScore(product.id);
  
  const revenue = product.price * Number(product.estimatedMonthlySales);
  const isRisingStar = Number(product.estimatedMonthlySales) > 500 && product.margin > 20;
  
  const getRecommendation = () => {
    if (!opportunityScore) return 'MODERATE';
    if (opportunityScore.score >= 70) return 'YES';
    if (opportunityScore.score < 40) return 'AVOID';
    return 'MODERATE';
  };

  const imageUrl = product.images[0]?.getDirectURL();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
          {isRisingStar && (
            <img
              src="/assets/generated/rising-star-badge.dim_128x128.png"
              alt="Rising Star"
              className="h-6 w-6 flex-shrink-0"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{product.category}</span>
          <span>•</span>
          <span>{product.subcategory}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-48 object-cover rounded-md"
          />
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-semibold">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Sales/mo</p>
            <p className="font-semibold">{product.estimatedMonthlySales.toString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="font-semibold">{formatCurrency(revenue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Margin</p>
            <p className="font-semibold">{product.margin.toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({product.reviewCount.toString()} reviews)</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Competition</span>
            <Badge variant={Number(product.reviewCount) < 200 ? 'default' : 'secondary'}>
              {Number(product.reviewCount) < 200 ? 'Low' : 'Medium'}
            </Badge>
          </div>
          {opportunityScore && (
            <OpportunityScoreMeter score={opportunityScore.score} />
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <RecommendationBadge recommendation={getRecommendation()} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/competitor-analysis/$productId', params: { productId: product.id } })}
          >
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

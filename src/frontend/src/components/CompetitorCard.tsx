import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CompetitorCardProps {
  competitor: {
    rank: number;
    sellerName: string;
    price: number;
    rating: number;
    reviews: number;
    listingQuality: number;
    weaknesses: string[];
  };
}

export default function CompetitorCard({ competitor }: CompetitorCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                {competitor.rank}
              </div>
              <div>
                <p className="font-semibold">{competitor.sellerName}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(competitor.price)}</p>
              </div>
            </div>
            <Badge variant={competitor.listingQuality > 70 ? 'default' : 'secondary'}>
              Quality: {Math.round(competitor.listingQuality)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{competitor.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">{competitor.reviews} reviews</span>
          </div>

          {competitor.weaknesses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Weaknesses Detected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {competitor.weaknesses.map((weakness, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

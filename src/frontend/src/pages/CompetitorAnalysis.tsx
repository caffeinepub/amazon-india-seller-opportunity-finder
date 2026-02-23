import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Star, Users } from 'lucide-react';
import CompetitorCard from '../components/CompetitorCard';
import LoadingStates from '../components/LoadingStates';

export default function CompetitorAnalysis() {
  const { productId } = useParams({ from: '/competitor-analysis/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProduct(productId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <LoadingStates />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <Button onClick={() => navigate({ to: '/dashboard' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Mock competitor data - in real app this would come from backend
  const competitors = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    sellerName: `Seller ${i + 1}`,
    price: product.price * (0.9 + Math.random() * 0.2),
    rating: 3.5 + Math.random() * 1.5,
    reviews: Math.floor(Math.random() * 1000),
    listingQuality: 60 + Math.random() * 40,
    weaknesses: ['Low review count', 'Poor images'].slice(0, Math.floor(Math.random() * 3)),
  }));

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-muted-foreground">{product.category} • {product.subcategory}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(product.price)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{product.rating.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.reviewCount.toString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{competitors.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="/assets/generated/competitor-icon.dim_128x128.png"
            alt="Competitor Analysis"
            className="h-8 w-8"
          />
          <h2 className="text-2xl font-bold">Top 10 Sellers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((competitor) => (
            <CompetitorCard key={competitor.rank} competitor={competitor} />
          ))}
        </div>
      </div>
    </div>
  );
}

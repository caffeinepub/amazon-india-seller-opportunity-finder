import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useFilteredProducts } from '../hooks/useProductFilters';

export default function AdvancedFilters() {
  const { filters, updateFilters, resetFilters } = useFilteredProducts();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState([4]);
  const [reviewMax, setReviewMax] = useState('');

  const handleApplyFilters = () => {
    updateFilters({
      priceRange: priceMin && priceMax ? [parseFloat(priceMin), parseFloat(priceMax)] : undefined,
      ratingThreshold: rating[0],
      reviewCountMax: reviewMax ? BigInt(reviewMax) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Price Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rating Threshold: {rating[0]}</Label>
          <Slider
            value={rating}
            onValueChange={setRating}
            min={1}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Max Reviews</Label>
          <Input
            type="number"
            placeholder="e.g., 200"
            value={reviewMax}
            onChange={(e) => setReviewMax(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="lightweight">Lightweight Preference</Label>
            <Switch
              id="lightweight"
              checked={filters.lightweightPreference}
              onCheckedChange={(checked) => updateFilters({ lightweightPreference: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="nonbranded">Non-Branded Friendly</Label>
            <Switch
              id="nonbranded"
              checked={filters.nonBrandedFriendly}
              onCheckedChange={(checked) => updateFilters({ nonBrandedFriendly: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lowfba">Low FBA Count</Label>
            <Switch
              id="lowfba"
              checked={filters.lowFBACount}
              onCheckedChange={(checked) => updateFilters({ lowFBACount: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="highgrowth">High Review Growth</Label>
            <Switch
              id="highgrowth"
              checked={filters.highReviewGrowth}
              onCheckedChange={(checked) => updateFilters({ highReviewGrowth: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="highmargin">High Margin (&gt;30%)</Label>
            <Switch
              id="highmargin"
              checked={filters.highMarginThreshold}
              onCheckedChange={(checked) => updateFilters({ highMarginThreshold: checked })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={resetFilters} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

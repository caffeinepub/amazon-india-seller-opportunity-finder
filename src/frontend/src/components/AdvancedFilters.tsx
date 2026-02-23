import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useProductFilters } from '../hooks/useProductFilters';
import { Badge } from '@/components/ui/badge';

export default function AdvancedFilters() {
  const { filters, updateFilters, resetFilters, hasActiveFilters } = useProductFilters();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState([4]);
  const [reviewMax, setReviewMax] = useState('');
  const [bsrMin, setBsrMin] = useState('');
  const [bsrMax, setBsrMax] = useState('');
  const [revenueMin, setRevenueMin] = useState('');
  const [revenueMax, setRevenueMax] = useState('');

  // Load existing filter values into local state
  useEffect(() => {
    if (filters.priceRange) {
      setPriceMin(filters.priceRange[0].toString());
      setPriceMax(filters.priceRange[1].toString());
    }
    if (filters.ratingThreshold !== undefined) {
      setRating([filters.ratingThreshold]);
    }
    if (filters.reviewCountMax !== undefined) {
      setReviewMax(filters.reviewCountMax.toString());
    }
    if (filters.bsrRange) {
      setBsrMin(filters.bsrRange[0].toString());
      setBsrMax(filters.bsrRange[1].toString());
    }
    if (filters.monthlyRevenueRange) {
      setRevenueMin(filters.monthlyRevenueRange[0].toString());
      setRevenueMax(filters.monthlyRevenueRange[1].toString());
    }
  }, []);

  const handleApplyFilters = () => {
    console.log('🎯 AdvancedFilters - Apply button clicked');
    console.log('📋 AdvancedFilters - Current local state:', {
      priceMin,
      priceMax,
      rating: rating[0],
      reviewMax,
      bsrMin,
      bsrMax,
      revenueMin,
      revenueMax,
      booleanFilters: {
        lightweightPreference: filters.lightweightPreference,
        nonBrandedFriendly: filters.nonBrandedFriendly,
        lowFBACount: filters.lowFBACount,
        highReviewGrowth: filters.highReviewGrowth,
        highMarginThreshold: filters.highMarginThreshold,
      },
    });

    const updates: Partial<typeof filters> = {};

    // Price range
    if (priceMin && priceMax) {
      const min = parseFloat(priceMin);
      const max = parseFloat(priceMax);
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        updates.priceRange = [min, max];
        console.log('✅ AdvancedFilters - Price range valid:', [min, max]);
      } else {
        console.warn('⚠️ AdvancedFilters - Invalid price range:', { min, max });
      }
    } else {
      updates.priceRange = undefined;
      console.log('ℹ️ AdvancedFilters - Price range cleared');
    }

    // Rating threshold
    updates.ratingThreshold = rating[0];
    console.log('✅ AdvancedFilters - Rating threshold:', rating[0]);

    // Review count max
    if (reviewMax) {
      const max = parseInt(reviewMax);
      if (!isNaN(max) && max > 0) {
        updates.reviewCountMax = BigInt(max);
        console.log('✅ AdvancedFilters - Review count max valid:', max);
      } else {
        console.warn('⚠️ AdvancedFilters - Invalid review count max:', reviewMax);
      }
    } else {
      updates.reviewCountMax = undefined;
      console.log('ℹ️ AdvancedFilters - Review count max cleared');
    }

    // BSR range
    if (bsrMin && bsrMax) {
      const min = parseInt(bsrMin);
      const max = parseInt(bsrMax);
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        updates.bsrRange = [BigInt(min), BigInt(max)];
        console.log('✅ AdvancedFilters - BSR range valid:', [min, max]);
      } else {
        console.warn('⚠️ AdvancedFilters - Invalid BSR range:', { min, max });
      }
    } else {
      updates.bsrRange = undefined;
      console.log('ℹ️ AdvancedFilters - BSR range cleared');
    }

    // Monthly revenue range
    if (revenueMin && revenueMax) {
      const min = parseFloat(revenueMin);
      const max = parseFloat(revenueMax);
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        updates.monthlyRevenueRange = [min, max];
        console.log('✅ AdvancedFilters - Revenue range valid:', [min, max]);
      } else {
        console.warn('⚠️ AdvancedFilters - Invalid revenue range:', { min, max });
      }
    } else {
      updates.monthlyRevenueRange = undefined;
      console.log('ℹ️ AdvancedFilters - Revenue range cleared');
    }

    console.log('📤 AdvancedFilters - Calling updateFilters with:', {
      ...updates,
      reviewCountMax: updates.reviewCountMax?.toString(),
      bsrRange: updates.bsrRange ? [updates.bsrRange[0].toString(), updates.bsrRange[1].toString()] : undefined,
    });

    updateFilters(updates);
    
    console.log('✅ AdvancedFilters - Filters applied successfully');
  };

  const handleReset = () => {
    console.log('🔄 AdvancedFilters - Reset button clicked');
    setPriceMin('');
    setPriceMax('');
    setRating([4]);
    setReviewMax('');
    setBsrMin('');
    setBsrMax('');
    setRevenueMin('');
    setRevenueMax('');
    resetFilters();
    console.log('✅ AdvancedFilters - All filters reset');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Price Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - Price min changed:', e.target.value);
                setPriceMin(e.target.value);
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - Price max changed:', e.target.value);
                setPriceMax(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rating Threshold: {rating[0]}</Label>
          <Slider
            value={rating}
            onValueChange={(value) => {
              console.log('📝 AdvancedFilters - Rating changed:', value[0]);
              setRating(value);
            }}
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
            onChange={(e) => {
              console.log('📝 AdvancedFilters - Review max changed:', e.target.value);
              setReviewMax(e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>BSR Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={bsrMin}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - BSR min changed:', e.target.value);
                setBsrMin(e.target.value);
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={bsrMax}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - BSR max changed:', e.target.value);
                setBsrMax(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Monthly Revenue Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={revenueMin}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - Revenue min changed:', e.target.value);
                setRevenueMin(e.target.value);
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={revenueMax}
              onChange={(e) => {
                console.log('📝 AdvancedFilters - Revenue max changed:', e.target.value);
                setRevenueMax(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="lightweight">Lightweight Preference</Label>
            <Switch
              id="lightweight"
              checked={filters.lightweightPreference}
              onCheckedChange={(checked) => {
                console.log('🔘 AdvancedFilters - Lightweight preference toggled:', checked);
                updateFilters({ lightweightPreference: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="nonbranded">Non-Branded Friendly</Label>
            <Switch
              id="nonbranded"
              checked={filters.nonBrandedFriendly}
              onCheckedChange={(checked) => {
                console.log('🔘 AdvancedFilters - Non-branded friendly toggled:', checked);
                updateFilters({ nonBrandedFriendly: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lowfba">Low FBA Count</Label>
            <Switch
              id="lowfba"
              checked={filters.lowFBACount}
              onCheckedChange={(checked) => {
                console.log('🔘 AdvancedFilters - Low FBA count toggled:', checked);
                updateFilters({ lowFBACount: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="highgrowth">High Review Growth</Label>
            <Switch
              id="highgrowth"
              checked={filters.highReviewGrowth}
              onCheckedChange={(checked) => {
                console.log('🔘 AdvancedFilters - High review growth toggled:', checked);
                updateFilters({ highReviewGrowth: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="highmargin">High Margin Threshold</Label>
            <Switch
              id="highmargin"
              checked={filters.highMarginThreshold}
              onCheckedChange={(checked) => {
                console.log('🔘 AdvancedFilters - High margin threshold toggled:', checked);
                updateFilters({ highMarginThreshold: checked });
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

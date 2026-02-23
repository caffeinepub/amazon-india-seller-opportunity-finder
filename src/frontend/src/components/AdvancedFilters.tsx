import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductFilters } from '../hooks/useProductFilters';

interface AdvancedFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onApply: () => void;
}

export default function AdvancedFilters({ filters, onFiltersChange, onApply }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof ProductFilters, value: string | boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    // Validate and sanitize all numeric inputs before applying
    const sanitized: ProductFilters = {
      ...localFilters,
      priceMin: localFilters.priceMin.trim(),
      priceMax: localFilters.priceMax.trim(),
      ratingThreshold: localFilters.ratingThreshold.trim(),
      reviewCountMax: localFilters.reviewCountMax.trim(),
      bsrMin: localFilters.bsrMin.trim(),
      bsrMax: localFilters.bsrMax.trim(),
      monthlyRevenueMin: localFilters.monthlyRevenueMin.trim(),
      monthlyRevenueMax: localFilters.monthlyRevenueMax.trim(),
    };

    onFiltersChange(sanitized);
    onApply();
  };

  const handleReset = () => {
    const resetFilters: ProductFilters = {
      category: '',
      subcategory: '',
      priceMin: '',
      priceMax: '',
      ratingThreshold: '',
      reviewCountMax: '',
      bsrMin: '',
      bsrMax: '',
      monthlyRevenueMin: '',
      monthlyRevenueMax: '',
      lightweightPreference: false,
      nonBrandedFriendly: false,
      lowFBACount: false,
      highReviewGrowth: false,
      highMarginThreshold: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.priceMin}
              onChange={(e) => handleInputChange('priceMin', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.priceMax}
              onChange={(e) => handleInputChange('priceMax', e.target.value)}
            />
          </div>
        </div>

        {/* Rating Threshold */}
        <div className="space-y-2">
          <Label>Minimum Rating</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="e.g., 4.0"
            value={localFilters.ratingThreshold}
            onChange={(e) => handleInputChange('ratingThreshold', e.target.value)}
          />
        </div>

        {/* Review Count Max */}
        <div className="space-y-2">
          <Label>Maximum Reviews</Label>
          <Input
            type="number"
            placeholder="e.g., 300"
            value={localFilters.reviewCountMax}
            onChange={(e) => handleInputChange('reviewCountMax', e.target.value)}
          />
        </div>

        <Separator />

        {/* BSR Range */}
        <div className="space-y-2">
          <Label>BSR Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min BSR"
              value={localFilters.bsrMin}
              onChange={(e) => handleInputChange('bsrMin', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max BSR"
              value={localFilters.bsrMax}
              onChange={(e) => handleInputChange('bsrMax', e.target.value)}
            />
          </div>
        </div>

        {/* Monthly Revenue Range */}
        <div className="space-y-2">
          <Label>Monthly Revenue Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Revenue"
              value={localFilters.monthlyRevenueMin}
              onChange={(e) => handleInputChange('monthlyRevenueMin', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Revenue"
              value={localFilters.monthlyRevenueMax}
              onChange={(e) => handleInputChange('monthlyRevenueMax', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Boolean Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="lightweight">Lightweight Products</Label>
            <Switch
              id="lightweight"
              checked={localFilters.lightweightPreference}
              onCheckedChange={(checked) => handleInputChange('lightweightPreference', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="nonBranded">Non-Branded Friendly</Label>
            <Switch
              id="nonBranded"
              checked={localFilters.nonBrandedFriendly}
              onCheckedChange={(checked) => handleInputChange('nonBrandedFriendly', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="lowFBA">Low FBA Competition</Label>
            <Switch
              id="lowFBA"
              checked={localFilters.lowFBACount}
              onCheckedChange={(checked) => handleInputChange('lowFBACount', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="highGrowth">High Review Growth</Label>
            <Switch
              id="highGrowth"
              checked={localFilters.highReviewGrowth}
              onCheckedChange={(checked) => handleInputChange('highReviewGrowth', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="highMargin">High Margin Threshold</Label>
            <Switch
              id="highMargin"
              checked={localFilters.highMarginThreshold}
              onCheckedChange={(checked) => handleInputChange('highMarginThreshold', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

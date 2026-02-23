import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateProfit } from '../utils/profitCalculations';
import { formatCurrency } from '../utils/formatters';

export default function ProfitCalculator() {
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [adsBudget, setAdsBudget] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    if (!sellingPrice || !costPrice) return;

    const profit = calculateProfit({
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice),
      weight: parseFloat(weight) || 0.5,
      adsBudget: parseFloat(adsBudget) || 0,
    });

    setResult(profit);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/profit-calc-icon.dim_128x128.png"
              alt="Profit Calculator"
              className="h-8 w-8"
            />
            <CardTitle>Profit Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="selling-price">Selling Price (₹)</Label>
            <Input
              id="selling-price"
              type="number"
              placeholder="e.g., 1000"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-price">Cost Price (₹)</Label>
            <Input
              id="cost-price"
              type="number"
              placeholder="e.g., 500"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ads-budget">Ads Budget per Unit (₹)</Label>
            <Input
              id="ads-budget"
              type="number"
              placeholder="e.g., 50"
              value={adsBudget}
              onChange={(e) => setAdsBudget(e.target.value)}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calculate Profit
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Profit Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Selling Price</span>
                <span className="font-medium">{formatCurrency(result.sellingPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amazon Referral Fee</span>
                <span className="text-red-500">-{formatCurrency(result.amazonReferralFees)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">FBA Fees</span>
                <span className="text-red-500">-{formatCurrency(result.fbaFees)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GST (18%)</span>
                <span className="text-red-500">-{formatCurrency(result.gstConsideration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Shipping Cost</span>
                <span className="text-red-500">-{formatCurrency(result.shippingCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Packaging Cost</span>
                <span className="text-red-500">-{formatCurrency(result.packagingCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ads Budget</span>
                <span className="text-red-500">-{formatCurrency(result.adsBudget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cost Price</span>
                <span className="text-red-500">-{formatCurrency(result.costPrice)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2">
                <span className="font-semibold">Net Profit per Unit</span>
                <span className={`font-bold text-lg ${result.netProfitPerUnit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(result.netProfitPerUnit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">ROI</span>
                <span className={`font-bold ${result.roiPercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {result.roiPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Break-even ACOS</span>
                <span className="font-bold">{result.breakEvenAcos.toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

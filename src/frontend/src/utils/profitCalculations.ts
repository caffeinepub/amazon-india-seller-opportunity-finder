interface ProfitInput {
  sellingPrice: number;
  costPrice: number;
  weight: number;
  adsBudget: number;
}

interface ProfitResult {
  sellingPrice: number;
  costPrice: number;
  amazonReferralFees: number;
  fbaFees: number;
  gstConsideration: number;
  shippingCost: number;
  packagingCost: number;
  adsBudget: number;
  netProfitPerUnit: number;
  roiPercentage: number;
  breakEvenAcos: number;
}

export function calculateProfit(input: ProfitInput): ProfitResult {
  const { sellingPrice, costPrice, weight, adsBudget } = input;

  // Amazon referral fee (typically 8-18% depending on category, using 15% average)
  const amazonReferralFees = sellingPrice * 0.15;

  // FBA fees based on weight (simplified calculation)
  const fbaFees = weight <= 0.5 ? 35 : weight <= 1 ? 45 : 55 + (weight - 1) * 10;

  // GST (18% on selling price)
  const gstConsideration = sellingPrice * 0.18;

  // Shipping cost (estimated)
  const shippingCost = weight * 20;

  // Packaging cost (estimated)
  const packagingCost = 15;

  // Calculate net profit
  const totalCosts =
    costPrice +
    amazonReferralFees +
    fbaFees +
    gstConsideration +
    shippingCost +
    packagingCost +
    adsBudget;

  const netProfitPerUnit = sellingPrice - totalCosts;

  // ROI percentage
  const roiPercentage = (netProfitPerUnit / costPrice) * 100;

  // Break-even ACOS (Advertising Cost of Sale)
  const breakEvenAcos = ((sellingPrice - costPrice - amazonReferralFees - fbaFees - gstConsideration - shippingCost - packagingCost) / sellingPrice) * 100;

  return {
    sellingPrice,
    costPrice,
    amazonReferralFees,
    fbaFees,
    gstConsideration,
    shippingCost,
    packagingCost,
    adsBudget,
    netProfitPerUnit,
    roiPercentage,
    breakEvenAcos: Math.max(0, breakEvenAcos),
  };
}

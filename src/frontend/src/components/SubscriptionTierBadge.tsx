import { Badge } from '@/components/ui/badge';
import { SubscriptionTier } from '../backend';
import { Crown, Zap, Gift } from 'lucide-react';

interface SubscriptionTierBadgeProps {
  tier: SubscriptionTier;
}

export default function SubscriptionTierBadge({ tier }: SubscriptionTierBadgeProps) {
  const config = {
    [SubscriptionTier.free]: {
      icon: Gift,
      label: 'Free',
      className: 'bg-gray-500 hover:bg-gray-600',
    },
    [SubscriptionTier.pro]: {
      icon: Zap,
      label: 'Pro',
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    [SubscriptionTier.premium]: {
      icon: Crown,
      label: 'Premium',
      className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
    },
  };

  const { icon: Icon, label, className } = config[tier];

  return (
    <Badge className={`${className} text-white`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

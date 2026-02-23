import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RecommendationBadgeProps {
  recommendation: 'YES' | 'AVOID' | 'MODERATE';
}

export default function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const config = {
    YES: {
      icon: CheckCircle,
      className: 'bg-green-500 hover:bg-green-600 text-white',
      label: 'Recommended',
    },
    AVOID: {
      icon: XCircle,
      className: 'bg-red-500 hover:bg-red-600 text-white',
      label: 'Avoid',
    },
    MODERATE: {
      icon: AlertCircle,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      label: 'Moderate',
    },
  };

  const { icon: Icon, className, label } = config[recommendation];

  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

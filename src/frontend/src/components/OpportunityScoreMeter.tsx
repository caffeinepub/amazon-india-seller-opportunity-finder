import { Progress } from '@/components/ui/progress';

interface OpportunityScoreMeterProps {
  score: number;
}

export default function OpportunityScoreMeter({ score }: OpportunityScoreMeterProps) {
  const getColor = () => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Opportunity Score</span>
        <span className="text-sm font-bold">{Math.round(score)}/100</span>
      </div>
      <div className="relative">
        <Progress value={score} className="h-2" />
        <div
          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

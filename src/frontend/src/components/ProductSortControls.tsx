import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortControlsProps {
  sortBy: 'score' | 'revenue' | 'competition' | 'growth';
  onSortChange: (sort: 'score' | 'revenue' | 'competition' | 'growth') => void;
}

export default function ProductSortControls({ sortBy, onSortChange }: ProductSortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Highest Score</SelectItem>
          <SelectItem value="revenue">Highest Revenue</SelectItem>
          <SelectItem value="competition">Lowest Competition</SelectItem>
          <SelectItem value="growth">Highest Growth</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

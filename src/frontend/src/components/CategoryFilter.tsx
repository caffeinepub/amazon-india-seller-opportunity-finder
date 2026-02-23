import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '../types/categories';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={selectedCategory === '' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onCategoryChange('')}
        >
          All Categories
        </Button>
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onCategoryChange(category.name)}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

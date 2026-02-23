import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoryHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Opportunity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
          <img
            src="/assets/generated/category-heatmap.dim_800x600.png"
            alt="Category Heatmap"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-sm text-muted-foreground">
              Visual representation of opportunity distribution across categories
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

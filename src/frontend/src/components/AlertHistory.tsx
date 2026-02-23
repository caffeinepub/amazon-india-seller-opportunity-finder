import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Tag, Calendar } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AlertHistoryProps {
  alerts: Alert[];
}

export default function AlertHistory({ alerts }: AlertHistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'competition':
        return Users;
      case 'keyword':
        return Tag;
      case 'seasonal':
        return Calendar;
      default:
        return TrendingUp;
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = getIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${alert.read ? 'bg-muted/30' : 'bg-muted'}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{alert.title}</p>
                    {!alert.read && <Badge variant="default" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

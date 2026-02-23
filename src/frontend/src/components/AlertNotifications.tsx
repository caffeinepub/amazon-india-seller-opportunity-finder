import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import AlertHistory from './AlertHistory';

export default function AlertNotifications() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock alerts - in real app this would come from backend
    const mockAlerts = [
      {
        id: '1',
        type: 'opportunity',
        title: 'New High-Opportunity Product',
        message: 'Wireless Earbuds in Electronics category shows 85% opportunity score',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'competition',
        title: 'Competition Drop Alert',
        message: 'Smart Watch category competition decreased by 15%',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ];
    setAlerts(mockAlerts);
    setUnreadCount(mockAlerts.filter(a => !a.read).length);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <img
            src="/assets/generated/alert-bell.dim_96x96.png"
            alt="Alerts"
            className="h-5 w-5"
          />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Alerts & Notifications</SheetTitle>
        </SheetHeader>
        <AlertHistory alerts={alerts} />
      </SheetContent>
    </Sheet>
  );
}

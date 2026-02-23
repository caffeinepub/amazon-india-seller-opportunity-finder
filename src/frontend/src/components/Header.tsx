import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import ThemeToggle from './ThemeToggle';
import { TrendingUp, Bell } from 'lucide-react';
import SubscriptionTierBadge from './SubscriptionTierBadge';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-chart-1" />
          <span className="font-bold text-lg">Amazon India Seller Finder</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <>
              <SubscriptionTierBadge tier={userProfile.subscriptionTier} />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {userProfile.name}
              </span>
            </>
          )}
          <ThemeToggle />
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
          >
            {text}
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { env } from '@/env';
import { supabase } from '@/lib/db';
import { isAuthenticatedAtom } from '@/stores/auth';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { LucideLoader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/app', replace: true });
    }
  }, [isAuthenticated, navigate]);

  const withLoading = async (fn: () => void | Promise<void>) => {
    setIsLoading(true);
    await fn();
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    await withLoading(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${env.VITE_APP_URL}/app`, // 認証後 /app にリダイレクト
        },
      });
      if (error) {
        console.error('Google login error:', error.message);
        toast.error('エラー', {
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            はるかぜ にログイン
          </CardTitle>
          <CardDescription>
            Googleアカウントでログインしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <LucideLoader className="animate-spin" />
            ) : (
              'Googleでログイン'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

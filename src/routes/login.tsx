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
import { useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/app', replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${env.VITE_APP_URL}/app`, // 認証後 /app にリダイレクト
      },
    });
    if (error) {
      console.error('Google login error:', error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            Googleアカウントでログインしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Googleでログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { supabase } from '@/lib/db';
import { sessionAtom } from '@/stores/auth';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: () => {
    const [, setSession] = useAtom(sessionAtom);

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }, [setSession]);

    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  },
});

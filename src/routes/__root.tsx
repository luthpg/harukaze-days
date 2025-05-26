import { env } from '@/env';
import { supabase } from '@/lib/db';
import { sessionAtom } from '@/stores/auth';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

const title = 'はるかぜ';
const description = 'シンプルな日付記録アプリ';
const xAuther = '@luthpg';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: title,
      },
      {
        name: 'description',
        content: description,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:site',
        content: xAuther,
      },
      {
        name: 'twitter:creator',
        content: xAuther,
      },
      {
        name: 'twitter:description',
        content: description,
      },
      {
        name: 'twitter:title',
        content: title,
      },
      {
        name: 'twitter:image',
        content: `${env.VITE_APP_URL}/logo192.png`,
      },
      {
        property: 'og:image',
        content: `${env.VITE_APP_URL}/logo192.png`,
      },
      {
        property: 'og:title',
        content: title,
      },
      {
        property: 'og:description',
        content: description,
      },
      {
        property: 'og:url',
        content: env.VITE_APP_URL,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: title,
      },
    ],
  }),
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

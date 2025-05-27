import { env } from '@/env';
import { supabase } from '@/lib/db';
import { sessionAtom } from '@/stores/auth';
import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';
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
        charSet: 'UTF-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'theme-color',
        content: '#00c951',
      },
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
        content: `${env.VITE_APP_URL}/logo.png`,
      },
      {
        property: 'og:image',
        content: `${env.VITE_APP_URL}/logo.png`,
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
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
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
        <HeadContent />
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  },
});

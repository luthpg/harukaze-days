import { serve } from '@hono/node-server';
import {
  type SupabaseClient,
  type User,
  createClient,
} from '@supabase/supabase-js';
import { createEnv } from '@t3-oss/env-core';
import { Hono } from 'hono';
// import { bearerAuth } from 'hono/bearer-auth'; // bearerAuth はトークンの存在と形式をチェックするが、検証は別途行う
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { z } from 'zod';
import 'dotenv/config';

const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url().min(1),
    SUPABASE_ANON_KEY: z.string().min(1),
    NODE_ENV: z.string().default('development'),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_SERVER_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Vercel 環境変数を想定
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const runtime = 'edge';

// 型定義: HonoのContextにユーザー情報を追加
interface AppContext {
  Variables: {
    user: User;
    // biome-ignore lint/suspicious/noExplicitAny: db schema
    supabaseClient: SupabaseClient<any, 'public', any>; // リクエストスコープのSupabaseクライアント
  };
}

const app = new Hono<AppContext>().basePath('/api');

// CORS設定
app.use(
  '*',
  cors({
    origin:
      env.NODE_ENV === 'development' ? '*' : [`https://${env.VITE_SERVER_URL}`], // 本番環境のURLに変更
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
  }),
);

const rootRoute = app.use('/', async (c) => {
  return c.text('ok');
});

// 認証ミドルウェア (Supabase JWTを検証し、リクエストスコープのクライアントを作成)
app.use('/auth/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { error: 'Unauthorized: Missing or invalid token format' },
      401,
    );
  }
  const token = authHeader.substring(7); // "Bearer " を除去

  // このSupabaseクライアントはトークン検証専用 (anon keyを使用)
  const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: authError,
  } = await supabaseAuthClient.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth error or no user:', authError?.message);
    return c.json(
      { error: 'Unauthorized: Invalid token or user not found' },
      401,
    );
  }

  // RLSを効かせるため、ユーザーのJWTを使ってリクエストスコープのSupabaseクライアントを作成
  const userSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  c.set('user', user);
  c.set('supabaseClient', userSupabaseClient); // 後続のハンドラで使用

  await next();
});

// --- API Routes ---
// GET /api/auth/dates - 記録された日付を取得
const getDatesRoute = app.get('/auth/dates', async (c) => {
  const supabase = c.get('supabaseClient'); // ミドルウェアでセットされたクライアント
  // const user = c.get('user'); // 必要であればユーザー情報も取得可能

  // RLSが auth.uid() = user_id を見てるので、user_id の条件は理論上不要
  // ただし、明示的に書いても害はない (RLSと合わせて二重チェックになる)
  const { data, error } = await supabase
    .from('dates')
    .select('*')
    // .eq('user_id', user.id) // RLSが適切に設定されていれば不要。auth.uid() が使われる。
    .order('date', { ascending: true });

  if (error) {
    console.error('GET /dates error:', error);
    return c.json({ error: error.message }, 500);
  }
  return c.json(data);
});

// POST /api/auth/dates - 新しい日付を記録
const postDatesRoute = app.post('/auth/dates', async (c) => {
  const supabase = c.get('supabaseClient');
  const user = c.get('user'); // user_id を明示的にセットする場合に取得
  const { date, note } = await c.req.json();

  if (!date) {
    return c.json({ error: 'Date is required' }, 400);
  }
  const formattedDate = new Date(date).toISOString().split('T')[0];

  // RLSの `WITH CHECK (auth.uid() = user_id)` ポリシーが働くので、
  // insert時に user_id を渡せば、それが auth.uid() と一致するかチェックされる。
  // もし user_id を渡さず、テーブル定義で user_id のデフォルト値が auth.uid() になっていればそれでも良い。
  const { data, error } = await supabase
    .from('dates')
    .insert([{ user_id: user.id, date: formattedDate, note: note || null }]) // user_id を明示
    .select()
    .single();

  if (error) {
    console.error('POST /dates error:', error);
    return c.json({ error: error.message }, 500);
  }
  return c.json(data, 201);
});

// PUT /api/auth/dates/:id - 日付情報を更新 (主に備考)
const putDatesRoute = app.put('/auth/dates/:id', async (c) => {
  const supabase = c.get('supabaseClient');
  // const user = c.get('user'); // RLSのため user_id を eq に含める必要は理論上ない
  const id = c.req.param('id');
  const { date, note } = await c.req.json();

  const updateData: { note?: string; date?: string } = {};
  if (note !== undefined) updateData.note = note;
  if (date) updateData.date = new Date(date).toISOString().split('T')[0];

  // RLSが auth.uid() = user_id の条件で絞り込む。
  // その上で指定された id のレコードを更新。
  const { data, error } = await supabase
    .from('dates')
    .update(updateData)
    .eq('id', id)
    // .eq('user_id', user.id) // RLSが適切に設定されていれば不要
    .select()
    .single();

  if (error) {
    console.error(`PUT /dates/${id} error:`, error);
    return c.json({ error: error.message }, 500);
  }
  if (!data) {
    return c.json({ error: 'Date record not found or not authorized' }, 404);
  }
  return c.json(data);
});

// DELETE /api/auth/dates/:id - 日付を削除
const deleteDatesRoute = app.delete('/auth/dates/:id', async (c) => {
  const supabase = c.get('supabaseClient');
  // const user = c.get('user'); // RLSのため user_id を eq に含める必要は理論上ない
  const id = c.req.param('id');

  // RLSが auth.uid() = user_id の条件で絞り込む。
  // その上で指定された id のレコードを削除。
  const { error, count } = await supabase
    .from('dates')
    .delete({ count: 'exact' })
    .eq('id', id);
  // .eq('user_id', user.id); // RLSが適切に設定されていれば不要

  if (error) {
    console.error(`DELETE /dates/${id} error:`, error);
    return c.json({ error: error.message }, 500);
  }
  if (count === 0) {
    return c.json({ error: 'Date record not found or not authorized' }, 404);
  }
  return c.json({ message: 'Date record deleted successfully' }, 200);
});

export type AppType =
  | typeof rootRoute
  | typeof getDatesRoute
  | typeof postDatesRoute
  | typeof putDatesRoute
  | typeof deleteDatesRoute;

const port = 3001;
if (process.env.NODE_ENV === 'development') {
  console.log(`Server is running on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
export default handler;

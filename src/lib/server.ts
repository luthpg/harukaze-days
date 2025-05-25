import type { AppType } from 'api/index';
import { hc } from 'hono/client';

export const honoClient = hc<AppType>('http://localhost:3001/api');

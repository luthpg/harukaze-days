import type { Session, User } from '@supabase/supabase-js';
import { atom } from 'jotai';

export const sessionAtom = atom<Session | null>(null);
export const userAtom = atom<User | null>(
  (get) => get(sessionAtom)?.user ?? null,
);
export const isAuthenticatedAtom = atom<boolean>((get) => !!get(userAtom));

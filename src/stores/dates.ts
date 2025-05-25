import type { DateRecord } from '@/types';
import { atom } from 'jotai';

export const recordedDatesAtom = atom<DateRecord[]>([]);
export const selectedDateAtom = atom<Date | undefined>(new Date()); // カレンダーで選択中の日付
export const editingDateRecordAtom = atom<DateRecord | null>(null); // 編集中の日付レコード

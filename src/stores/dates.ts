import type { DateRecord } from '@/types';
import { differenceInDays, isValid, parseISO } from 'date-fns'; // isValid を追加
import { atom } from 'jotai';

export const recordedDatesAtom = atom<DateRecord[]>([]);
export const selectedDateAtom = atom<Date | undefined>(new Date());
export const editingDateRecordAtom = atom<DateRecord | null>(null);
export const averageIntervalDaysAtom = atom<number | null>((get) => {
  const datesRecords = get(recordedDatesAtom);

  if (datesRecords.length < 2) {
    return null; // 記録が2件未満の場合は平均間隔を計算できない
  }

  // 日付をパースし、有効なものだけを昇順にソート
  const sortedValidDates = datesRecords
    .map((record) => parseISO(record.date))
    .filter((dateObj) => isValid(dateObj)) // 無効な日付を除外
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedValidDates.length < 2) {
    return null; // 有効な日付が2件未満の場合も計算不可
  }

  const intervalsInDays: number[] = [];
  for (let i = 0; i < sortedValidDates.length - 1; i++) {
    // 隣り合う日付の差を日数で計算
    const diff = differenceInDays(sortedValidDates[i + 1], sortedValidDates[i]);
    intervalsInDays.push(diff);
  }

  if (intervalsInDays.length === 0) {
    return null; // 通常、この条件には達しないはず
  }

  const totalIntervalDays = intervalsInDays.reduce(
    (sum, interval) => sum + interval,
    0,
  );
  const average = totalIntervalDays / intervalsInDays.length;

  return Number.parseFloat(average.toFixed(1));
});

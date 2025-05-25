import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dateService } from '@/services/api';
import { editingDateRecordAtom, recordedDatesAtom } from '@/stores/dates';
import type { DateRecord } from '@/types';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState<Date | undefined>(
    new Date(),
  );
  const [recordedDates, setRecordedDates] = useAtom(recordedDatesAtom);
  const [editingRecord, setEditingRecord] = useAtom(editingDateRecordAtom);
  const [note, setNote] = useState('');
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [dateToDelete, setDateToDelete] = useState<DateRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDates = async () => {
    try {
      const dates = await dateService.getDates();
      setRecordedDates(dates);
    } catch (error) {
      toast.error('エラー', {
        description: (error as Error).message,
      });
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedCalDate(date);
    const dateOnly = startOfDay(date); // 時間情報を除去

    const existingRecord = recordedDates.find((r) =>
      isSameDay(parseISO(r.date), dateOnly),
    );

    if (existingRecord) {
      // 既に記録済みの日付をクリックした場合 -> 編集ダイアログを開くか、削除確認
      setEditingRecord(existingRecord);
      setNote(existingRecord.note || '');
      setIsEditModalOpen(true);
    } else {
      // 未記録の日付をクリックした場合 -> ワンクリック登録
      try {
        const newRecord = await dateService.addDate(
          format(dateOnly, 'yyyy-MM-dd'),
        );
        setRecordedDates((prev) => [...prev, newRecord]);
        toast.success('成功', {
          description: `${format(dateOnly, 'yyyy/MM/dd')} を記録しました。`,
        });
      } catch (error) {
        toast.error('エラー', {
          description: (error as Error).message,
        });
      }
    }
  };

  const handleSaveNote = async () => {
    if (!editingRecord) return;
    try {
      const updatedRecord = await dateService.updateDate(editingRecord.id, {
        note,
        date: editingRecord.date,
      });
      setRecordedDates((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)),
      );
      toast.success('成功', { description: '備考を更新しました。' });
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error('エラー', {
        description: (error as Error).message,
      });
    }
  };

  const openDeleteConfirmDialog = (record: DateRecord) => {
    setDateToDelete(record);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteDate = async () => {
    if (!dateToDelete) return;
    try {
      await dateService.deleteDate(dateToDelete.id);
      setRecordedDates((prev) => prev.filter((r) => r.id !== dateToDelete.id));
      toast.success('成功', { description: '記録を削除しました。' });
      setIsConfirmDeleteDialogOpen(false);
      setDateToDelete(null);
      if (editingRecord?.id === dateToDelete.id) {
        // 編集中のものが削除されたら編集モーダルも閉じる
        setIsEditModalOpen(false);
        setEditingRecord(null);
      }
    } catch (error) {
      toast.error('エラー', {
        description: (error as Error).message,
      });
    }
  };

  const recordedDatesSet = new Set(
    recordedDates.map((r) => format(parseISO(r.date), 'yyyy-MM-dd')),
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Card className="md:w-auto mx-auto shadow-lg">
        <CardContent className="p-2 md:p-4">
          <Calendar
            mode="single"
            selected={selectedCalDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md"
            modifiers={{
              recorded: (date) =>
                recordedDatesSet.has(format(date, 'yyyy-MM-dd')),
            }}
            modifiersStyles={{
              recorded: {
                fontWeight: 'bold',
                // Tailwind CSS class for visual emphasis (e.g., bg-primary/20, ring-2 ring-primary)
                // Shadcn Calendarのday_selectedのスタイルを参考にカスタム
                border: '2px solid hsl(var(--primary))',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                textDecoration: 'underline',
              },
            }}
            // components={{
            //   // 記録済みの日付にドットを表示する例 (modifiersClassnames で対応する方が Shadcn/UI らしい)
            //   DayContent: (props) => {
            //     const isRecorded = recordedDatesSet.has(
            //       format(props.date, 'yyyy-MM-dd'),
            //     );
            //     return (
            //       <div className="relative">
            //         {props.date.getDate()}
            //         {isRecorded && (
            //           <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
            //         )}
            //       </div>
            //     );
            //   },
            // }}
          />
        </CardContent>
      </Card>

      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">記録済みの日付</h2>
        {recordedDates.length === 0 ? (
          <p className="text-muted-foreground">記録された日付はありません。</p>
        ) : (
          <ul className="space-y-2">
            {recordedDates
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((record) => (
                <li
                  key={record.id}
                  className="flex justify-between items-center p-3 bg-secondary/30 rounded-md"
                >
                  <div>
                    <span className="font-medium">
                      {format(parseISO(record.date), 'yyyy年MM月dd日')}
                    </span>
                    {record.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.note}
                      </p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRecord(record);
                        setNote(record.note || '');
                        setIsEditModalOpen(true);
                      }}
                    >
                      編集
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteConfirmDialog(record)}
                    >
                      削除
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* 編集モーダル */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記録を編集</DialogTitle>
            <DialogDescription>
              {editingRecord
                ? format(parseISO(editingRecord.date), 'yyyy年MM月dd日')
                : ''}{' '}
              の記録を編集します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                備考
              </Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="col-span-3"
                placeholder="オプションの備考"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                editingRecord && openDeleteConfirmDialog(editingRecord)
              }
            >
              この記録を削除
            </Button>
            <div>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="mr-2">
                  キャンセル
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveNote}>
                保存
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>
              {dateToDelete
                ? format(parseISO(dateToDelete.date), 'yyyy年MM月dd日')
                : ''}{' '}
              の記録を本当に削除しますか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteDate}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

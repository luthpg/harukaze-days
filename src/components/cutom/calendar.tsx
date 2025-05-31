import { Calendar as OriginalCalendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { DateFormatter, DayPicker } from 'react-day-picker';

function Calendar({
  actonButton,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  actonButton?: React.ReactNode;
}) {
  const formatCaption: DateFormatter = (date, options) => {
    const y = format(date, 'yyyy');
    const m = format(date, 'MM', { locale: options?.locale });
    return `${y}年${m}月`;
  };
  return (
    <OriginalCalendar locale={ja} formatters={{ formatCaption }} {...props} />
  );
}

export { Calendar };

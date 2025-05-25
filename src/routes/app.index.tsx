import CalendarView from '@/components/views/Calendar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/')({
  component: CalendarPage,
});

function CalendarPage() {
  return <CalendarView />;
}

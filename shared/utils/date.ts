// KRITIKUS: minden lista event_date szerint rendez, NEM created_at
import { format, parseISO, startOfWeek, addWeeks, isValid } from 'date-fns';
import { hu } from 'date-fns/locale';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return dateStr;
  return format(parsed, 'yyyy. MMM d.', { locale: hu });
}

export function getWeekStart(dateStr?: string): string {
  const base = dateStr ? parseISO(dateStr) : new Date();
  const monday = startOfWeek(base, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function getNextWeekStart(dateStr?: string): string {
  return format(addWeeks(parseISO(getWeekStart(dateStr)), 1), 'yyyy-MM-dd');
}

export function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return isValid(parseISO(s));
}

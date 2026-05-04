import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDateWithDay = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd(E)', { locale: ko });
  } catch {
    return dateStr;
  }
};

export const formatYearMonth = (date: Date) => {
  return format(date, 'yyyy년 M월');
};

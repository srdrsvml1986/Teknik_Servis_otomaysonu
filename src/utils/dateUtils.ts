import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatString: string = 'dd MMM yyyy') => {
  return format(new Date(date), formatString, { locale: tr });
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr });
};

export const formatDateTimeSeconds = (date: string | Date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm:ss', { locale: tr });
};
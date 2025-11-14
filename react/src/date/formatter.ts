const padZero = (num: number): string => String(num).padStart(2, '0');

export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = padZero(today.getMonth() + 1);
  const day = padZero(today.getDate());
  return `${year}-${month}-${day}`;
};

export const formatDate = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = padZero(dateObj.getMonth() + 1);
  const day = padZero(dateObj.getDate());
  return `${year}-${month}-${day}`;
};

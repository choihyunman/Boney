export const getKSTEndOfDayString = (dateStr: string) => {
  const date = `${dateStr}T23:59:59.998`;
  return date;
};

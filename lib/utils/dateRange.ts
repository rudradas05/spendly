export function getMonthRangeInIST(date = new Date()) {
  // Convert the given date to IST
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 min in ms
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + IST_OFFSET);

  const startOfMonth = new Date(
    istDate.getFullYear(),
    istDate.getMonth(),
    1,
    0, 0, 0, 0
  );
  const endOfMonth = new Date(
    istDate.getFullYear(),
    istDate.getMonth() + 1,
    0,
    23, 59, 59, 999
  );

  // Convert back to UTC so DB query works correctly
  return {
    startOfMonth: new Date(startOfMonth.getTime() - IST_OFFSET),
    endOfMonth: new Date(endOfMonth.getTime() - IST_OFFSET),
  };
}

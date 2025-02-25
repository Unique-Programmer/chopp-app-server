import { PERIOD } from '../enums/period';

export function getCurrentIntervals(startDate: Date, endDate: Date, days: number, period: PERIOD): [Date, Date] {
  let dateFrom: Date;
  let dateTo: Date = new Date();

  if (startDate && endDate) {
    dateFrom = new Date(startDate);
    dateTo = new Date(endDate);
  } else if (startDate && !endDate) {
    dateFrom = new Date(startDate);
    dateTo = new Date();
  } else if (days) {
    dateFrom = new Date();
    dateFrom.setDate(dateTo.getDate() - days);
  } else if (period) {
    dateFrom = new Date();
    switch (period) {
      case PERIOD.DAY:
        dateFrom.setDate(dateFrom.getDate() - 1);
        break;
      case PERIOD.WEEK:
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case PERIOD.MONTH:
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
    }
  } else {
    dateFrom = new Date();
    dateFrom.setDate(dateTo.getDate() - 1);
  }
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(23, 59, 59, 999);
  return [dateFrom, dateTo];
}

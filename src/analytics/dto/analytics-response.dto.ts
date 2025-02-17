import { IDailyAnalytics, ISummaryAnalytics } from 'src/shared/types';

export class OrderAnalyticsResponseDTO {
  items: IDailyAnalytics[];
  summary: ISummaryAnalytics;
}

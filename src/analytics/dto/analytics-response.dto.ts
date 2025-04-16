import { DailyAnalytics, SummaryAnalytics } from 'src/shared/types';

export class OrderAnalyticsResponseDTO {
  items: DailyAnalytics[];
  summary: SummaryAnalytics;
}

export type AnalyticsQueryResult = {
  date: string;
  orders: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  avgAmount: number;
};

export type AmountAnalytics = {
  value: string;
  currency: string;
};

export type SummaryAnalytics = {
  totalAmount: AmountAnalytics;
  minOrderAmount: string;
  maxOrderAmount: string;
  averageOrderAmount: string;
};

export type DailyAnalytics = {
  date: string;
  ordersQuantity: number;
  amount: AmountAnalytics;
};

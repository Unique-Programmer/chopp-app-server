export interface IAnalyticsQueryResult {
  date: string;
  orders: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  avgAmount: number;
}

export interface IAmountAnalytics {
  value: string;
  currency: string;
}

export interface ISummaryAnalytics {
  totalAmount: IAmountAnalytics;
  minOrderAmount: string;
  maxOrderAmount: string;
  averageOrderAmount: string;
}

export interface IDailyAnalytics {
  date: string;
  ordersQuantity: number;
  amount: IAmountAnalytics;
}

export interface StatsOverviewResponse {
  readonly sent: number;
  readonly delivered: number;
  readonly failed: number;
  readonly bounced: number;
  readonly complained: number;
  readonly opened?: number;
  readonly clicked?: number;
}

export interface StatsDeliveryResponse {
  readonly deliveryRate: number;
  readonly bounceRate: number;
  readonly complaintRate: number;
  readonly openRate?: number;
  readonly clickRate?: number;
}

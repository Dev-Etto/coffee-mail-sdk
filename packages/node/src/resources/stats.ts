import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type { StatsDeliveryResponse, StatsOverviewResponse } from '../types/stats.types.js';

export class Stats {
  constructor(private readonly http: HttpClient) {}

  public async getOverview(query?: { from?: string; to?: string }): Promise<CoffeeMailResponse<StatsOverviewResponse>> {
    return this.http.get<StatsOverviewResponse>('/v1/product/stats/overview', query);
  }

  public async getDelivery(query?: { from?: string; to?: string }): Promise<CoffeeMailResponse<StatsDeliveryResponse>> {
    return this.http.get<StatsDeliveryResponse>('/v1/product/stats/delivery', query);
  }
}

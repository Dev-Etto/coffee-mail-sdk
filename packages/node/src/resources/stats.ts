import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type { GetStatsQuery, StatsResponse } from '../types/stats.types.js';

export class Stats {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retorna totais do período e uma série histórica agrupada por
   * granularity (day/week/month). Aceita filtro por domínio, tag,
   * intervalo de datas explícito (startDate/endDate) ou um atalho relativo
   * (period: 'last7d' | 'last30d' | 'last90d').
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.stats.get({ period: 'last30d' });
   * ```
   */
  public async get(query?: GetStatsQuery): Promise<CoffeeMailResponse<StatsResponse>> {
    return this.http.get<StatsResponse>('/v1/product/stats', query as Record<string, string | number>);
  }
}

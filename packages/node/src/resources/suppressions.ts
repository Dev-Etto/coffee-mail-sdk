import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  CheckSuppressionResponse,
  CreateSuppressionPayload,
  SuppressionDetail,
} from '../types/suppressions.types.js';

export class Suppressions {
  constructor(private readonly http: HttpClient) {}

  public async list(query?: { limit?: number; offset?: number }): Promise<CoffeeMailResponse<ReadonlyArray<SuppressionDetail>>> {
    return this.http.get<ReadonlyArray<SuppressionDetail>>('/v1/product/suppressions', query);
  }

  public async create(payload: CreateSuppressionPayload): Promise<CoffeeMailResponse<SuppressionDetail>> {
    return this.http.post<SuppressionDetail>('/v1/product/suppressions', payload);
  }

  public async delete(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly deleted: boolean }>> {
    return this.http.delete<{ readonly id: string; readonly deleted: boolean }>(`/v1/product/suppressions/${id}`);
  }

  public async check(email: string): Promise<CoffeeMailResponse<CheckSuppressionResponse>> {
    return this.http.get<CheckSuppressionResponse>('/v1/product/suppressions/check', { email });
  }
}

import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type { BroadcastDetail, CreateBroadcastPayload } from '../types/broadcasts.types.js';

/**
 * Converte `scheduledAt` (Date | string | undefined) em string ISO 8601 ou undefined.
 * Mesmo helper usado em `emails.ts`, isolado para evitar dependência cruzada entre resources.
 */
const normalizeScheduledAt = (value: Date | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

export class Broadcasts {
  constructor(private readonly http: HttpClient) {}

  public async create(payload: CreateBroadcastPayload): Promise<CoffeeMailResponse<BroadcastDetail>> {
    const scheduledAt = normalizeScheduledAt(payload.scheduledAt);

    return this.http.post<BroadcastDetail>('/v1/product/broadcasts', {
      ...payload,
      ...(scheduledAt ? { scheduledAt } : {}),
    });
  }

  public async list(query?: { limit?: number; offset?: number }): Promise<CoffeeMailResponse<ReadonlyArray<BroadcastDetail>>> {
    return this.http.get<ReadonlyArray<BroadcastDetail>>('/v1/product/broadcasts', query);
  }

  public async get(id: string): Promise<CoffeeMailResponse<BroadcastDetail>> {
    return this.http.get<BroadcastDetail>(`/v1/product/broadcasts/${id}`);
  }

  public async send(id: string): Promise<CoffeeMailResponse<BroadcastDetail>> {
    return this.http.post<BroadcastDetail>(`/v1/product/broadcasts/${id}/send`);
  }

  public async cancel(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly status: string }>> {
    return this.http.post<{ readonly id: string; readonly status: string }>(`/v1/product/broadcasts/${id}/cancel`);
  }
}

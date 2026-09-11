import type { HttpClient } from "../core/http-client.js";
import type { CoffeeMailResponse } from "../core/types.js";
import type {
  BroadcastDetail,
  CancelBroadcastResult,
  CreateBroadcastPayload,
  ListBroadcastsQuery,
  ListBroadcastsResponse,
  SendBroadcastResult,
} from "../types/broadcasts.types.js";

/**
 * Converte `scheduledAt` (Date | string | undefined) em string ISO 8601 ou undefined.
 * Mesmo helper usado em `emails.ts`, isolado para evitar dependência cruzada entre resources.
 */
const normalizeScheduledAt = (
  value: Date | string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

export class Broadcasts {
  constructor(private readonly http: HttpClient) {}

  public async create(
    payload: CreateBroadcastPayload,
  ): Promise<CoffeeMailResponse<BroadcastDetail>> {
    const scheduledAt = normalizeScheduledAt(payload.scheduledAt);

    return this.http.post<BroadcastDetail>("/v1/product/broadcasts", {
      ...payload,
      ...(scheduledAt ? { scheduledAt } : {}),
    });
  }

  public async list(
    query?: ListBroadcastsQuery,
  ): Promise<CoffeeMailResponse<ListBroadcastsResponse>> {
    return this.http.get<ListBroadcastsResponse>(
      "/v1/product/broadcasts",
      query as Record<string, string | number>,
    );
  }

  public async get(id: string): Promise<CoffeeMailResponse<BroadcastDetail>> {
    return this.http.get<BroadcastDetail>(`/v1/product/broadcasts/${id}`);
  }

  public async send(
    id: string,
  ): Promise<CoffeeMailResponse<SendBroadcastResult>> {
    return this.http.post<SendBroadcastResult>(
      `/v1/product/broadcasts/${id}/send`,
    );
  }

  public async cancel(
    id: string,
  ): Promise<CoffeeMailResponse<CancelBroadcastResult>> {
    return this.http.post<CancelBroadcastResult>(
      `/v1/product/broadcasts/${id}/cancel`,
    );
  }
}

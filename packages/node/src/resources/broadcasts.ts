import type { HttpClient } from "../core/http-client.js";
import { normalizeScheduledAt } from "../core/normalizers.js";
import { toQueryParams } from "../core/query.js";
import type { CoffeeMailResponse } from "../core/types.js";
import type {
  BroadcastDetail,
  CancelBroadcastResult,
  CreateBroadcastPayload,
  ListBroadcastsQuery,
  ListBroadcastsResponse,
  SendBroadcastResult,
} from "../types/broadcasts.types.js";

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
      toQueryParams(query),
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

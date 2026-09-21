import type { HttpClient } from "../core/http-client.js";
import { PermissionError } from "../core/errors.js";
import { getI18nMessage } from "../core/i18n/index.js";
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

const REQUIRES_FULL_ACCESS = "full_access";

export class Broadcasts {
  constructor(private readonly http: HttpClient) {}

  public async create(
    payload: CreateBroadcastPayload,
  ): Promise<CoffeeMailResponse<BroadcastDetail>> {
    const permissionCheck = await this.assertFullAccess("broadcasts.create");
    if (permissionCheck) return permissionCheck;

    const scheduledAt = normalizeScheduledAt(payload.scheduledAt);

    return this.http.post<BroadcastDetail>("/v1/product/broadcasts", {
      ...payload,
      ...(scheduledAt ? { scheduledAt } : {}),
    });
  }

  public async list(
    query?: ListBroadcastsQuery,
  ): Promise<CoffeeMailResponse<ListBroadcastsResponse>> {
    const permissionCheck = await this.assertFullAccess("broadcasts.list");
    if (permissionCheck) return permissionCheck;

    return this.http.get<ListBroadcastsResponse>(
      "/v1/product/broadcasts",
      toQueryParams(query),
    );
  }

  public async get(id: string): Promise<CoffeeMailResponse<BroadcastDetail>> {
    const permissionCheck = await this.assertFullAccess("broadcasts.get");
    if (permissionCheck) return permissionCheck;

    return this.http.get<BroadcastDetail>(`/v1/product/broadcasts/${id}`);
  }

  public async send(
    id: string,
  ): Promise<CoffeeMailResponse<SendBroadcastResult>> {
    const permissionCheck = await this.assertFullAccess("broadcasts.send");
    if (permissionCheck) return permissionCheck;

    return this.http.post<SendBroadcastResult>(
      `/v1/product/broadcasts/${id}/send`,
    );
  }

  public async cancel(
    id: string,
  ): Promise<CoffeeMailResponse<CancelBroadcastResult>> {
    const permissionCheck = await this.assertFullAccess("broadcasts.cancel");
    if (permissionCheck) return permissionCheck;

    return this.http.post<CancelBroadcastResult>(
      `/v1/product/broadcasts/${id}/cancel`,
    );
  }

  private async assertFullAccess(
    operation: string,
  ): Promise<CoffeeMailResponse<never> | null> {
    const result = await this.http.introspect();
    if (!result.data) return null;

    const scopes = result.data.scopes;
    const hasFull = scopes.includes(REQUIRES_FULL_ACCESS);
    if (hasFull) return null;

    return {
      data: null,
      error: new PermissionError(
        getI18nMessage("permissionDenied", this.http.getLocale(), {
          requiredPermission: `${REQUIRES_FULL_ACCESS} (called by ${operation})`,
        }),
        REQUIRES_FULL_ACCESS,
        { operation, currentScopes: scopes },
      ),
    };
  }
}

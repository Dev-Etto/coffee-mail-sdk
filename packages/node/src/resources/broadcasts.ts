import type { HttpClient } from "../core/http-client.js";
import { ForbiddenError, PermissionError } from "../core/errors.js";
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
    const scheduledAt = normalizeScheduledAt(payload.scheduledAt);

    const result = await this.http.post<BroadcastDetail>(
      "/v1/product/broadcasts",
      { ...payload, ...(scheduledAt ? { scheduledAt } : {}) },
    );
    return this.remapForbidden(result, "broadcasts.create");
  }

  public async list(
    query?: ListBroadcastsQuery,
  ): Promise<CoffeeMailResponse<ListBroadcastsResponse>> {
    const result = await this.http.get<ListBroadcastsResponse>(
      "/v1/product/broadcasts",
      toQueryParams(query),
    );
    return this.remapForbidden(result, "broadcasts.list");
  }

  public async get(id: string): Promise<CoffeeMailResponse<BroadcastDetail>> {
    const result = await this.http.get<BroadcastDetail>(
      `/v1/product/broadcasts/${id}`,
    );
    return this.remapForbidden(result, "broadcasts.get");
  }

  public async send(
    id: string,
  ): Promise<CoffeeMailResponse<SendBroadcastResult>> {
    const result = await this.http.post<SendBroadcastResult>(
      `/v1/product/broadcasts/${id}/send`,
    );
    return this.remapForbidden(result, "broadcasts.send");
  }

  public async cancel(
    id: string,
  ): Promise<CoffeeMailResponse<CancelBroadcastResult>> {
    const result = await this.http.post<CancelBroadcastResult>(
      `/v1/product/broadcasts/${id}/cancel`,
    );
    return this.remapForbidden(result, "broadcasts.cancel");
  }

  /**
   * O servidor já aplica a autorização de `full_access` para broadcasts (HTTP 403).
   * Este método preserva o contrato público pré-existente convertendo esse 403
   * (que o SDK mapeia para `ForbiddenError`) de volta para `PermissionError` —
   * a classe que este recurso sempre expôs para esse cenário — sem reintroduzir
   * o pre-flight client-side que causava falso-negativo (fail-open quando a
   * introspecção falhava) e falso-positivo (cache de 5min rejeitando chamadas
   * válidas após um upgrade de escopo).
   */
  private remapForbidden<T>(
    result: CoffeeMailResponse<T>,
    operation: string,
  ): CoffeeMailResponse<T> {
    if (!(result.error instanceof ForbiddenError)) return result;

    return {
      data: null,
      error: new PermissionError(
        getI18nMessage("permissionDenied", this.http.getLocale(), {
          requiredPermission: `${REQUIRES_FULL_ACCESS} (called by ${operation})`,
        }),
        REQUIRES_FULL_ACCESS,
        { operation, details: result.error.details },
      ),
    };
  }
}

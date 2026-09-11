import { createHmac, timingSafeEqual } from "node:crypto";

import type { HttpClient } from "../core/http-client.js";
import type { CoffeeMailResponse } from "../core/types.js";
import type {
  CreateWebhookPayload,
  CreatedWebhookDetail,
  ListWebhookDeliveriesQuery,
  ListWebhookDeliveriesResponse,
  ListWebhooksQuery,
  ListWebhooksResponse,
  RotateWebhookSecretResult,
  TestWebhookResult,
  ToggleWebhookPayload,
  ToggleWebhookResult,
  UpdateWebhookPayload,
  VerifyWebhookSignatureOptions,
  WebhookDetail,
} from "../types/webhooks.types.js";

/**
 * Recurso de gerenciamento e verificação criptográfica de Webhooks do CoffeeMail.
 */
export class Webhooks {
  constructor(private readonly http: HttpClient) {}

  /**
   * Cadastra um novo endpoint de webhook na plataforma.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.create({
   *   url: 'https://minha-api.com.br/api/webhooks/coffeemail',
   *   events: ['email.delivered', 'email.bounced'],
   *   secret: 'whsec_meu_segredo'
   * });
   * ```
   */
  public async create(
    payload: CreateWebhookPayload,
  ): Promise<CoffeeMailResponse<CreatedWebhookDetail>> {
    return this.http.post<CreatedWebhookDetail>(
      "/v1/product/webhooks",
      payload,
    );
  }

  /**
   * Lista todos os webhooks cadastrados na organização.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.list();
   * console.log(data?.webhooks);
   * ```
   */
  public async list(
    query?: ListWebhooksQuery,
  ): Promise<CoffeeMailResponse<ListWebhooksResponse>> {
    return this.http.get<ListWebhooksResponse>(
      "/v1/product/webhooks",
      query as Record<string, string | number>,
    );
  }

  /**
   * Obtém detalhes de um webhook cadastrado.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.get('wh_123');
   * ```
   */
  public async get(id: string): Promise<CoffeeMailResponse<WebhookDetail>> {
    return this.http.get<WebhookDetail>(`/v1/product/webhooks/${id}`);
  }

  /**
   * Atualiza configurações de um webhook.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.update('wh_123', {
   *   events: ['email.delivered', 'email.bounced', 'email.complained']
   * });
   * ```
   */
  public async update(
    id: string,
    payload: UpdateWebhookPayload,
  ): Promise<CoffeeMailResponse<WebhookDetail>> {
    return this.http.put<WebhookDetail>(`/v1/product/webhooks/${id}`, payload);
  }

  /**
   * Ativa ou pausa um webhook, sem alterar url, events ou description.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.toggle('wh_123', { status: 'paused' });
   * ```
   */
  public async toggle(
    id: string,
    payload: ToggleWebhookPayload,
  ): Promise<CoffeeMailResponse<ToggleWebhookResult>> {
    return this.http.patch<ToggleWebhookResult>(
      `/v1/product/webhooks/${id}`,
      payload,
    );
  }

  /**
   * Remove um webhook da organização. Não retorna corpo na resposta (204 No Content).
   *
   * @example
   * ```typescript
   * const { error } = await coffeemail.webhooks.delete('wh_123');
   * ```
   */
  public async delete(id: string): Promise<CoffeeMailResponse<void>> {
    return this.http.delete<void>(`/v1/product/webhooks/${id}`);
  }

  /**
   * Gera um novo segredo HMAC para o webhook, invalidando o anterior.
   * O valor completo só é retornado nesta resposta — guarde-o com segurança.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.rotateSecret('wh_123');
   * ```
   */
  public async rotateSecret(
    id: string,
  ): Promise<CoffeeMailResponse<RotateWebhookSecretResult>> {
    return this.http.post<RotateWebhookSecretResult>(
      `/v1/product/webhooks/${id}/rotate-secret`,
    );
  }

  /**
   * Lista as tentativas de entrega de eventos para um webhook.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.listDeliveries('wh_123', { status: 'failed' });
   * ```
   */
  public async listDeliveries(
    id: string,
    query?: ListWebhookDeliveriesQuery,
  ): Promise<CoffeeMailResponse<ListWebhookDeliveriesResponse>> {
    return this.http.get<ListWebhookDeliveriesResponse>(
      `/v1/product/webhooks/${id}/deliveries`,
      query as Record<string, string | number>,
    );
  }

  /**
   * Dispara um envio de teste simulado para o endpoint do webhook.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.test('wh_123');
   * ```
   */
  public async test(
    id: string,
  ): Promise<CoffeeMailResponse<TestWebhookResult>> {
    return this.http.post<TestWebhookResult>(`/v1/product/webhooks/${id}/test`);
  }

  /**
   * Valida a autenticidade de um webhook recebido no seu servidor via assinatura HMAC SHA-256.
   * Protege contra requisições forjadas e ataques de temporização (timing attacks).
   *
   * @example
   * ```typescript
   * // Em uma rota Next.js / Express / Fastify:
   * const isValid = coffeemail.webhooks.verifySignature({
   *   payload: rawBody,
   *   signature: req.headers['x-coffeemail-signature'],
   *   secret: 'whsec_seu_segredo',
   * });
   *
   * if (!isValid) {
   *   return res.status(401).send('Assinatura inválida');
   * }
   * ```
   */
  public verifySignature(options: VerifyWebhookSignatureOptions): boolean {
    return Webhooks.verifySignature(options);
  }

  /**
   * Método estático auxiliar para validação de assinatura sem necessidade de instanciar o cliente.
   */
  public static verifySignature(
    options: VerifyWebhookSignatureOptions,
  ): boolean {
    try {
      const { payload, signature, secret } = options;
      if (!signature || !secret || !payload) return false;

      // `payload` pode chegar como `string`, `Buffer` (Node) ou `Uint8Array` (web).
      // Em todos os casos, transformamos para o raw body string que será hasheado.
      const rawString =
        typeof payload === "string"
          ? payload
          : Buffer.isBuffer(payload)
            ? payload.toString("utf-8")
            : new TextDecoder("utf-8").decode(payload);

      const computed = createHmac("sha256", secret)
        .update(rawString)
        .digest("hex");

      const expectedBuffer = Buffer.from(computed, "utf-8");
      const receivedBuffer = Buffer.from(signature, "utf-8");

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }
}

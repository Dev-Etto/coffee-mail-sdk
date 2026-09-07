import { createHmac, timingSafeEqual } from 'node:crypto';

import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  CreateWebhookPayload,
  VerifyWebhookSignatureOptions,
  WebhookDetail,
} from '../types/webhooks.types.js';

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
  public async create(payload: CreateWebhookPayload): Promise<CoffeeMailResponse<WebhookDetail>> {
    return this.http.post<WebhookDetail>('/v1/product/webhooks', payload);
  }

  /**
   * Lista todos os webhooks cadastrados na organização.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.list();
   * ```
   */
  public async list(): Promise<CoffeeMailResponse<ReadonlyArray<WebhookDetail>>> {
    return this.http.get<ReadonlyArray<WebhookDetail>>('/v1/product/webhooks');
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
    payload: Partial<CreateWebhookPayload>
  ): Promise<CoffeeMailResponse<WebhookDetail>> {
    return this.http.put<WebhookDetail>(`/v1/product/webhooks/${id}`, payload);
  }

  /**
   * Remove um webhook da organização.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.delete('wh_123');
   * ```
   */
  public async delete(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly deleted: boolean }>> {
    return this.http.delete<{ readonly id: string; readonly deleted: boolean }>(`/v1/product/webhooks/${id}`);
  }

  /**
   * Dispara um envio de teste simulado para o endpoint do webhook.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.webhooks.test('wh_123');
   * ```
   */
  public async test(id: string): Promise<CoffeeMailResponse<{ readonly success: boolean; readonly statusCode?: number }>> {
    return this.http.post<{ readonly success: boolean; readonly statusCode?: number }>(
      `/v1/product/webhooks/${id}/test`
    );
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
  public static verifySignature(options: VerifyWebhookSignatureOptions): boolean {
    try {
      const { payload, signature, secret } = options;
      if (!signature || !secret || !payload) return false;

      // `payload` pode chegar como `string`, `Buffer` (Node) ou `Uint8Array` (web).
      // Em todos os casos, transformamos para o raw body string que será hasheado.
      const rawString =
        typeof payload === 'string'
          ? payload
          : Buffer.isBuffer(payload)
            ? payload.toString('utf-8')
            : new TextDecoder('utf-8').decode(payload);

      const computed = createHmac('sha256', secret).update(rawString).digest('hex');

      const expectedBuffer = Buffer.from(computed, 'utf-8');
      const receivedBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }
}

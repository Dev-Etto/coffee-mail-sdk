import type { BinaryData } from "../core/types.js";

/**
 * Eventos emitidos pela plataforma CoffeeMail através de webhooks.
 */
export type WebhookEventType =
  | "email.queued"
  | "email.processing"
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.opened"
  | "email.clicked"
  | "email.bounced"
  | "email.complained"
  | "email.failed"
  | "email.suppressed"
  | "email.scheduled"
  | "email.cancelled"
  | "email.unsubscribed"
  | "billing.plan_changed";

/**
 * Situação de um webhook. `disabled` é atribuído pelo sistema (ex: após
 * falhas repetidas) e não pode ser definido diretamente via `toggle()`,
 * que só aceita `active`/`paused`.
 */
export type WebhookStatus = "active" | "paused" | "disabled";

export type ToggleableWebhookStatus = "active" | "paused";

/**
 * Detalhes de um webhook, como retornado por `get()` e `update()`.
 * `secret` é sempre `null` aqui — depois da criação, o segredo completo só é
 * exibido de novo através de `rotateSecret()`. Use `secretPreview` para exibição.
 */
export interface WebhookDetail {
  readonly id: string;
  readonly url: string;
  readonly events: ReadonlyArray<WebhookEventType>;
  readonly status: WebhookStatus;
  readonly description: string | null;
  readonly createdAt: string;
  readonly secret: string | null;
  readonly secretPreview: string | null;
}

/**
 * Detalhe retornado imediatamente após `create()`, com o segredo completo —
 * essa é a única vez que o valor completo é exposto.
 */
export interface CreatedWebhookDetail {
  readonly id: string;
  readonly url: string;
  readonly events: ReadonlyArray<WebhookEventType>;
  readonly status: WebhookStatus;
  readonly description: string | null;
  readonly createdAt: string;
  readonly secret: string;
}

/**
 * Resumo de um webhook, como retornado por `list()`. Não inclui o segredo —
 * apenas um indicador de que um segredo está configurado.
 */
export interface WebhookSummary {
  readonly id: string;
  readonly url: string;
  readonly events: ReadonlyArray<WebhookEventType>;
  readonly status: WebhookStatus;
  readonly description: string | null;
  readonly hasSecret: boolean;
  readonly createdAt: string;
}

export interface ListWebhooksResponse {
  readonly webhooks: ReadonlyArray<WebhookSummary>;
}

export interface ListWebhooksQuery {
  readonly status?: WebhookStatus;
}

export interface CreateWebhookPayload {
  readonly url: string;
  readonly events: ReadonlyArray<WebhookEventType>;
  readonly description?: string;
}

export interface UpdateWebhookPayload {
  readonly url?: string;
  readonly events?: ReadonlyArray<WebhookEventType>;
  readonly description?: string | null;
}

export interface ToggleWebhookPayload {
  readonly status: ToggleableWebhookStatus;
}

export interface ToggleWebhookResult {
  readonly id: string;
  readonly status: ToggleableWebhookStatus;
}

/**
 * Resultado de `rotateSecret()`. O novo segredo é exibido por completo uma
 * única vez — não pode ser recuperado depois.
 */
export interface RotateWebhookSecretResult {
  readonly webhookId: string;
  readonly secret: string;
}

export interface TestWebhookResult {
  readonly status: "success" | "failed";
  readonly statusCode: number | null;
  readonly body: string | null;
  readonly error: string | null;
}

export type WebhookDeliveryStatus =
  "pending" | "success" | "failed" | "exhausted";

export interface WebhookDelivery {
  readonly id: string;
  readonly webhookId: string;
  readonly emailEventId: string | null;
  readonly eventType: string;
  readonly responseStatus: number | null;
  readonly responseBody: string | null;
  readonly attempts: number;
  readonly lastError: string | null;
  readonly status: WebhookDeliveryStatus;
  readonly nextRunAt: string;
  readonly createdAt: string;
}

export interface ListWebhookDeliveriesResponse {
  readonly deliveries: ReadonlyArray<WebhookDelivery>;
}

export interface ListWebhookDeliveriesQuery {
  readonly eventType?: string;
  readonly status?: WebhookDeliveryStatus;
  readonly from?: string;
  readonly to?: string;
  readonly limit?: number;
}

/**
 * Parâmetros para validação de assinatura criptográfica de webhook.
 */
export interface VerifyWebhookSignatureOptions {
  /**
   * Corpo bruto da requisição HTTP (string ou Uint8Array).
   * Não passe o JSON já parseado para evitar alterações em espaços ou formatação.
   *
   * `Buffer` (Node) também é aceito em runtime pois estende `Uint8Array`,
   * mas o tipo público propositalmente não cita `Buffer` para não vazar
   * tipos do Node no `.d.ts` consumido por runtimes que não têm `Buffer`.
   *
   * @see BinaryData
   */
  readonly payload: BinaryData;
  /**
   * Valor recebido no cabeçalho HTTP `X-CoffeeMail-Signature` ou `x-coffeemail-signature`.
   */
  readonly signature: string;
  /**
   * Segredo configurado no cadastro do webhook (chave secreta).
   */
  readonly secret: string;
}

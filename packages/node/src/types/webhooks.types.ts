import type { BinaryData } from '../core/types.js';

/**
 * Eventos emitidos pela plataforma CoffeeMail através de webhooks.
 */
export type WebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.bounced'
  | 'email.complained'
  | 'email.opened'
  | 'email.clicked'
  | 'email.failed'
  | 'email.suppressed'
  | 'email.delivery_delayed';

/**
 * Detalhes de um endpoint de webhook registrado.
 */
export interface WebhookDetail {
  readonly id: string;
  readonly url: string;
  readonly events: ReadonlyArray<WebhookEventType>;
  readonly active: boolean;
  readonly secret?: string;
  readonly createdAt: string;
}

/**
 * Parâmetros para cadastro de um novo webhook.
 */
export interface CreateWebhookPayload {
  /**
   * URL de destino HTTPS para recebimento dos payloads JSON.
   */
  readonly url: string;
  /**
   * Lista de eventos que este webhook deve escutar.
   */
  readonly events: ReadonlyArray<WebhookEventType>;
  /**
   * Segredo compartilhado opcional para geração de assinatura HMAC SHA-256.
   */
  readonly secret?: string;
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

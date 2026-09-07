import { Buffer } from 'node:buffer';

import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  EmailAddressInput,
  EmailAttachment,
  EmailDetail,
  EmailEventsResponse,
  EmailParticipant,
  ListEmailsQuery,
  ListEmailsResponse,
  SendEmailPayload,
  SendEmailResponse,
} from '../types/emails.types.js';

/**
 * Retorna `true` para valores "presentes" no payload: não-undefined, não-vazio para
 * coleções e não-string-vazia para textos. Usado para filtrar campos opcionais antes
 * de enviá-los para a API (a API rejeita campos `null`/`""` que não foram pedidos).
 */
const isPresent = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const normalizeParticipant = (input: EmailAddressInput): EmailParticipant => {
  if (typeof input === 'string') {
    return { email: input.trim() };
  }
  return { email: input.email.trim(), ...(input.name ? { name: input.name.trim() } : {}) };
};

const normalizeList = (
  input?: EmailAddressInput | ReadonlyArray<EmailAddressInput>
): EmailParticipant[] | undefined => {
  if (!input) return undefined;
  if (Array.isArray(input)) {
    return input.map(normalizeParticipant);
  }
  return [normalizeParticipant(input as EmailAddressInput)];
};

const serializeAttachment = (
  attachment: EmailAttachment
): Record<string, unknown> => {
  const content =
    typeof attachment.content === 'string'
      ? attachment.content
      : Buffer.isBuffer(attachment.content)
        ? attachment.content.toString('base64')
        : String(attachment.content);

  return {
    filename: attachment.filename,
    content,
    contentType: attachment.contentType ?? 'application/octet-stream',
    disposition: attachment.disposition ?? 'attachment',
    ...(attachment.cid ? { cid: attachment.cid } : {}),
  };
};

/**
 * Converte `scheduledAt` (Date | ISO string) para ISO 8601. Retorna `undefined` se ausente.
 */
const normalizeScheduledAt = (value: Date | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

/**
 * Mapa declarativo do payload → body da requisição HTTP.
 *
 * Cada entrada diz: "do campo `source` do payload, derive o valor a ser colocado
 * sob a chave `target` no body". Quando o `source` é `undefined`/vazio, a entrada
 * é ignorada. Se houver `map`, o valor é transformado antes de entrar no body
 * (útil para normalizar `Date → ISO`, listas, anexos, etc.).
 *
 * Por que isso é melhor que `...(x ? { x } : {})` repetido?
 *   1. Adicionar um campo novo = 1 linha.
 *   2. Trocar a normalização de um campo = 1 ponto de edição.
 *   3. A regra de "presente vs. ausente" é uniforme (sem 13 ternários divergentes).
 *
 * O tipo é propositalmente sem generics: o `map` aceita `unknown` para que o array
 * seja homogêneo e a inferência funcione sem virar uma união patológica.
 */
type PayloadEntry = {
  readonly source: keyof SendEmailPayload;
  readonly target: string;
  readonly map?: (value: unknown) => unknown;
};

const PAYLOAD_ENTRIES: ReadonlyArray<PayloadEntry> = [
  { source: 'cc', target: 'cc', map: (v) => normalizeList(v as EmailAddressInput | ReadonlyArray<EmailAddressInput>) },
  { source: 'bcc', target: 'bcc', map: (v) => normalizeList(v as EmailAddressInput | ReadonlyArray<EmailAddressInput>) },
  { source: 'replyTo', target: 'replyTo', map: (v) => normalizeParticipant(v as EmailAddressInput) },
  { source: 'html', target: 'html' },
  { source: 'text', target: 'text' },
  { source: 'templateId', target: 'templateId' },
  { source: 'variables', target: 'variables' },
  { source: 'headers', target: 'headers' },
  { source: 'attachments', target: 'attachments', map: (v) => (v as ReadonlyArray<EmailAttachment>).map(serializeAttachment) },
  { source: 'tags', target: 'tags' },
  { source: 'idempotencyKey', target: 'idempotencyKey' },
];

const formatSendBody = (payload: SendEmailPayload): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    from: normalizeParticipant(payload.from),
    to: normalizeList(payload.to) ?? [],
    subject: payload.subject,
  };

  for (const entry of PAYLOAD_ENTRIES) {
    const raw = payload[entry.source];
    if (!isPresent(raw)) continue;

    const value = entry.map ? entry.map(raw) : raw;
    if (!isPresent(value)) continue;
    body[entry.target] = value;
  }

  const scheduledAt = normalizeScheduledAt(payload.scheduledAt);
  if (scheduledAt !== undefined) {
    body['scheduledAt'] = scheduledAt;
  }

  // `isSandbox` aceita `false` como valor válido, então a regra de presença é
  // `!== undefined` (e não `isPresent`, que rejeitaria `false`).
  if (payload.isSandbox !== undefined) {
    body['isSandbox'] = payload.isSandbox;
  }

  return body;
};

/**
 * Recurso de gerenciamento e disparo de e-mails da API CoffeeMail.
 */
export class Emails {
  constructor(private readonly http: HttpClient) {}

  /**
   * Envia um e-mail transacional único.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.send({
   *   from: 'contato@seudominio.com.br',
   *   to: 'cliente@gmail.com',
   *   subject: 'Pedido #123 Confirmado',
   *   html: '<h1>Obrigado por sua compra!</h1>'
   * });
   * ```
   */
  public async send(payload: SendEmailPayload): Promise<CoffeeMailResponse<SendEmailResponse>> {
    return this.http.post<SendEmailResponse>('/v1/product/emails', formatSendBody(payload));
  }

  /**
   * Envia múltiplos e-mails transacionais em uma única requisição (em lote).
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.sendBatch([
   *   { from: 'alertas@seudominio.com', to: 'user1@gmail.com', subject: 'Aviso', html: '<p>Mensagem 1</p>' },
   *   { from: 'alertas@seudominio.com', to: 'user2@gmail.com', subject: 'Aviso', html: '<p>Mensagem 2</p>' }
   * ]);
   * ```
   */
  public async sendBatch(
    items: ReadonlyArray<SendEmailPayload>
  ): Promise<CoffeeMailResponse<{ readonly data: ReadonlyArray<SendEmailResponse> }>> {
    const formatted = items.map(formatSendBody);
    return this.http.post<{ readonly data: ReadonlyArray<SendEmailResponse> }>(
      '/v1/product/emails/batch',
      formatted
    );
  }

  /**
   * Obtém os detalhes completos de um e-mail específico pelo ID.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.get('eml_8f92b7c4');
   * if (data) {
   *   console.log(`Status do e-mail: ${data.status}`);
   * }
   * ```
   */
  public async get(id: string): Promise<CoffeeMailResponse<EmailDetail>> {
    return this.http.get<EmailDetail>(`/v1/product/emails/${id}`);
  }

  /**
   * Lista o histórico de e-mails enviados com suporte a paginação e filtros.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.list({ limit: 50, status: 'delivered' });
   * ```
   */
  public async list(query?: ListEmailsQuery): Promise<CoffeeMailResponse<ListEmailsResponse>> {
    return this.http.get<ListEmailsResponse>('/v1/product/emails', query as Record<string, string | number>);
  }

  /**
   * Consulta a linha do tempo completa de eventos de entrega (queued -> sent -> delivered / bounced).
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.getEvents('eml_8f92b7c4');
   * ```
   */
  public async getEvents(id: string): Promise<CoffeeMailResponse<EmailEventsResponse>> {
    return this.http.get<EmailEventsResponse>(`/v1/product/emails/${id}/events`);
  }

  /**
   * Cancela o envio de um e-mail previamente agendado (`scheduled`).
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.cancel('eml_8f92b7c4');
   * ```
   */
  public async cancel(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly status: string }>> {
    return this.http.post<{ readonly id: string; readonly status: string }>(
      `/v1/product/emails/${id}/cancel`
    );
  }

  /**
   * Reenvia um e-mail existente.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.emails.resend('eml_8f92b7c4');
   * ```
   */
  public async resend(id: string): Promise<CoffeeMailResponse<SendEmailResponse>> {
    return this.http.post<SendEmailResponse>(`/v1/product/emails/${id}/resend`);
  }
}

import type { BinaryData } from '../core/types.js';

/**
 * Objeto representando um endereço de e-mail com nome amigável opcional.
 */
export interface EmailParticipant {
  /**
   * Endereço de e-mail (ex: contato@seudominio.com).
   */
  readonly email: string;
  /**
   * Nome de exibição opcional (ex: Suporte CoffeeMail).
   */
  readonly name?: string;
}

/**
 * Tipo unificado para aceitar string pura ("contato@empresa.com") ou objeto detalhado.
 */
export type EmailAddressInput = string | EmailParticipant;

/**
 * Anexo de e-mail.
 */
export interface EmailAttachment {
  /**
   * Nome do arquivo exibido no cliente de e-mail (ex: fatura.pdf).
   */
  readonly filename: string;
  /**
   * Conteúdo do anexo. Aceita string (Base64 ou texto puro) ou `Uint8Array`
   * (que é o supertipo de `Buffer` em Node — então `Buffer` também funciona
   * sem aparecer no `.d.ts`).
   *
   * @see BinaryData
   */
  readonly content: BinaryData;
  /**
   * MIME Type do arquivo (ex: application/pdf, image/png).
   */
  readonly contentType?: string;
  /**
   * Modo de anexação: download convencional ('attachment') ou embutido ('inline').
   */
  readonly disposition?: 'attachment' | 'inline';
  /**
   * Content-ID para imagens embutidas no corpo HTML (cid:...).
   */
  readonly cid?: string;
}

/**
 * Tag personalizada para rastreamento e segmentação.
 */
export interface EmailTag {
  readonly name: string;
  readonly value: string;
}

/**
 * Parâmetros de entrada para envio de e-mail transacional.
 */
export interface SendEmailPayload {
  /**
   * Endereço do remetente. O domínio deve pertencer à sua organização e estar verificado.
   * Aceita string simples ("nome@dominio.com") ou objeto ({ email: "nome@dominio.com", name: "Empresa" }).
   * @example "contato@seudominio.com.br"
   * @example { email: "suporte@seudominio.com.br", name: "Equipe de Suporte" }
   */
  readonly from: EmailAddressInput;

  /**
   * Destinatário ou lista de destinatários principais.
   * @example "cliente@gmail.com"
   * @example ["cliente1@gmail.com", "cliente2@outlook.com"]
   */
  readonly to: EmailAddressInput | ReadonlyArray<EmailAddressInput>;

  /**
   * Destinatários em cópia (CC).
   */
  readonly cc?: EmailAddressInput | ReadonlyArray<EmailAddressInput>;

  /**
   * Destinatários em cópia oculta (BCC).
   */
  readonly bcc?: EmailAddressInput | ReadonlyArray<EmailAddressInput>;

  /**
   * Endereço de resposta quando o cliente clica em "Responder".
   */
  readonly replyTo?: EmailAddressInput;

  /**
   * Assunto do e-mail.
   * @example "Seu pedido foi confirmado!"
   */
  readonly subject: string;

  /**
   * Conteúdo em formato HTML.
   * @example "<h1>Olá!</h1><p>Seu código é 123456.</p>"
   */
  readonly html?: string;

  /**
   * Conteúdo alternativo em texto puro (fallback para leitores simples).
   */
  readonly text?: string;

  /**
   * ID de um modelo pré-cadastrado na plataforma.
   */
  readonly templateId?: string;

  /**
   * Variáveis para substituição dinâmica no template (ex: {{ nome }}).
   */
  readonly variables?: Record<string, unknown>;

  /**
   * Data e hora programada para envio futuro (ISO 8601 ou objeto Date).
   */
  readonly scheduledAt?: Date | string;

  /**
   * Cabeçalhos adicionais customizados (Headers MIME).
   */
  readonly headers?: Record<string, string>;

  /**
   * Lista de arquivos anexos.
   */
  readonly attachments?: ReadonlyArray<EmailAttachment>;

  /**
   * Tags para métricas e categorização.
   */
  readonly tags?: ReadonlyArray<EmailTag>;

  /**
   * Chave de idempotência para evitar envios duplicados em caso de retentativa de rede.
   */
  readonly idempotencyKey?: string;

  /**
   * Se verdadeiro, o e-mail não é entregue de fato, simulando entrega para testes (sandbox).
   */
  readonly isSandbox?: boolean;
}

/**
 * Resposta de sucesso ao enfileirar um e-mail.
 */
export interface SendEmailResponse {
  /**
   * Identificador único do e-mail gerado pelo CoffeeMail.
   */
  readonly id: string;
  /**
   * Status inicial ('queued' ou 'scheduled').
   */
  readonly status: 'queued' | 'scheduled';
  /**
   * Data e hora em que a mensagem entrou na fila.
   */
  readonly queuedAt: string;
}

/**
 * Detalhes completos de um e-mail já processado ou em andamento.
 */
export interface EmailDetail {
  readonly id: string;
  readonly from: string;
  readonly to: ReadonlyArray<string>;
  readonly cc?: ReadonlyArray<string>;
  readonly bcc?: ReadonlyArray<string>;
  readonly replyTo?: string;
  readonly subject: string;
  readonly status:
    | 'queued'
    | 'scheduled'
    | 'processing'
    | 'sent'
    | 'delivered'
    | 'failed'
    | 'bounced'
    | 'complained'
    | 'skipped'
    | 'cancelled';
  readonly html?: string;
  readonly text?: string;
  readonly lastError?: string;
  readonly createdAt: string;
  readonly sentAt?: string;
  readonly deliveredAt?: string;
  readonly failedAt?: string;
  readonly scheduledAt?: string;
  readonly tags?: ReadonlyArray<EmailTag>;
}

/**
 * Parâmetros de consulta para listagem de e-mails.
 */
export interface ListEmailsQuery {
  /**
   * Quantidade máxima de registros a retornar (padrão: 20, máx: 100).
   */
  readonly limit?: number;
  /**
   * Deslocamento da paginação (offset).
   */
  readonly offset?: number;
  /**
   * Filtrar por status específico.
   */
  readonly status?: EmailDetail['status'];
  /**
   * Filtrar por endereço de remetente.
   */
  readonly from?: string;
  /**
   * Filtrar por endereço de destinatário.
   */
  readonly to?: string;
}

/**
 * Resposta paginada de listagem de e-mails.
 */
export interface ListEmailsResponse {
  readonly emails: ReadonlyArray<EmailDetail>;
  readonly total: number;
  readonly hasMore: boolean;
}

/**
 * Evento individual da linha do tempo do e-mail.
 */
export interface EmailTimelineEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: string;
  readonly details?: unknown;
}

export interface EmailEventsResponse {
  readonly events: ReadonlyArray<EmailTimelineEvent>;
}

import { getI18nMessage, type CoffeeMailLocale } from './i18n/index.js';

export interface ApiErrorPayload {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: unknown;
  };
  readonly message?: string;
  readonly statusCode?: number;
}

/**
 * Classe base para todos os erros emitidos pelo SDK do CoffeeMail.
 */
export class CoffeeMailError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'CoffeeMailError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Erro disparado quando o payload ou parâmetros enviados falham na validação (HTTP 400).
 */
export class ValidationError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Erro disparado quando a chave de API é inválida, ausente ou expirou (HTTP 401).
 */
export class AuthenticationError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro disparado quando o plano do assinante atingiu a cota limite ou necessita de upgrade (HTTP 402).
 */
export class PaymentRequiredError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 402, 'PAYMENT_REQUIRED', details);
    this.name = 'PaymentRequiredError';
  }
}

/**
 * Erro disparado quando a chave de API não possui permissão para o recurso solicitado (HTTP 403).
 */
export class ForbiddenError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenError';
  }
}

/**
 * Erro disparado quando o recurso solicitado (e-mail, domínio, etc.) não foi encontrado (HTTP 404).
 */
export class NotFoundError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro disparado quando ocorre conflito com recurso já existente, como domínio duplicado (HTTP 409).
 */
export class ConflictError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * Erro disparado quando a taxa limite de requisições por segundo/minuto foi excedida (HTTP 429).
 */
export class RateLimitError extends CoffeeMailError {
  public readonly retryAfterSeconds?: number | undefined;

  constructor(message: string, retryAfterSeconds?: number | undefined, details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Erro disparado por falha na camada de rede, DNS ou tempo limite da requisição.
 */
export class NetworkError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 0, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

/**
 * Erro interno do servidor (HTTP 500).
 */
export class InternalServerError extends CoffeeMailError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}

/**
 * Mapa de fábrica: status HTTP → classe de erro especializada.
 *
 * Substitui o antigo `switch` por um lookup O(1), mais idiomático em TypeScript,
 * mais fácil de estender (basta adicionar uma entrada) e que evita fallthroughs
 * acidentais. Para mapear múltiplos status para a mesma classe (ex.: 5xx), basta
 * adicionar uma nova entrada na tabela.
 */
type ErrorFactory = (message: string, details?: unknown) => CoffeeMailError;

const errorFactoriesByStatus: Readonly<Record<number, ErrorFactory>> = {
  400: (message, details) => new ValidationError(message, details),
  401: (message, details) => new AuthenticationError(message, details),
  402: (message, details) => new PaymentRequiredError(message, details),
  403: (message, details) => new ForbiddenError(message, details),
  404: (message, details) => new NotFoundError(message, details),
  409: (message, details) => new ConflictError(message, details),
  429: (message, details) => new RateLimitError(message, undefined, details),
  500: (message, details) => new InternalServerError(message, details),
  502: (message, details) => new InternalServerError(message, details),
  503: (message, details) => new InternalServerError(message, details),
  504: (message, details) => new InternalServerError(message, details),
};

export const createErrorFromResponse = (
  status: number,
  payload: unknown,
  locale: CoffeeMailLocale
): CoffeeMailError => {
  const errPayload = (payload && typeof payload === 'object' ? payload : {}) as ApiErrorPayload;
  const message =
    errPayload.error?.message ||
    errPayload.message ||
    getI18nMessage('unexpectedError', locale);
  const code = errPayload.error?.code || 'API_ERROR';
  const details = errPayload.error?.details;

  const factory = errorFactoriesByStatus[status];
  if (factory) {
    return factory(message, details);
  }

  return new CoffeeMailError(message, status, code, details);
};

import type { CoffeeMailError } from "./errors.js";
import type { CoffeeMailLocale } from "./i18n/types.js";

/**
 * Dados binários aceitos pelo SDK. Modelado como `string | Uint8Array` no contrato
 * público para **não vazar `Buffer` (Node-only) no `.d.ts` publicado** — assim o
 * SDK pode ser instalado em projetos rodando em runtime que não tem `Buffer` (Deno,
 * Cloudflare Workers, edge runtime) sem que o consumidor veja tipos que não existem
 * no seu ambiente.
 *
 * Internamente o SDK também aceita `Buffer` (Node), mas como `Buffer extends Uint8Array`,
 * a tipagem pública cobre esse caso sem precisar importar o tipo do Node no `.d.ts`.
 *
 * @example
 * ```typescript
 * // String (Base64 ou texto puro):
 * { content: 'iVBORw0KGgoAA...' }
 *
 * // Uint8Array (web standard, ou Buffer em Node — Buffer extends Uint8Array):
 * { content: new Uint8Array([0x89, 0x50, 0x4E, 0x47]) }
 * ```
 */
export type BinaryData = string | Uint8Array;

/**
 * Padrão seguro de retorno de todas as operações do SDK.
 * Evita a necessidade obrigatória de blocos try/catch ao consumidor.
 */
export type CoffeeMailResponse<T> =
  | {
      readonly data: T;
      readonly error: null;
    }
  | {
      readonly data: null;
      readonly error: CoffeeMailError;
    };

/**
 * Opções de configuração para inicializar o cliente CoffeeMail.
 */
export interface CoffeeMailClientOptions {
  /**
   * Idioma padrão para mensagens de erro e respostas da API.
   * @default 'pt-BR'
   */
  readonly locale?: CoffeeMailLocale;

  /**
   * Tempo limite da requisição em milissegundos.
   * @default 10000 (10 segundos)
   */
  readonly timeoutMs?: number;

  /**
   * Função customizada de fetch (útil para testes ou proxies).
   */
  readonly fetch?: typeof globalThis.fetch;
}

/**
 * Query de paginação por offset, usada pelos resources que ainda não migraram
 * para paginação por cursor (ex: audiences, contacts).
 */
export interface OffsetPaginationQuery {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Opções para execução de chamadas HTTP internas.
 */
export interface HttpRequestOptions {
  readonly path: string;
  readonly method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
  readonly body?: unknown | undefined;
  readonly query?:
    Record<string, string | number | boolean | undefined | null> | undefined;
  readonly headers?: Record<string, string> | undefined;
}

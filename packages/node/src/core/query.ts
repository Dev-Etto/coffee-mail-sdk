import type { HttpRequestOptions } from "./types.js";

/**
 * Adapta um objeto de query tipado (ex: `ListEmailsQuery`) para o shape aceito
 * por `HttpClient` (`Record<string, string | number | boolean | undefined | null>`).
 * Centraliza a única conversão de tipo necessária entre os DTOs de query de cada
 * resource e o cliente HTTP genérico.
 */
export const toQueryParams = <T extends object>(
  query: T | undefined,
): HttpRequestOptions["query"] => query as HttpRequestOptions["query"];

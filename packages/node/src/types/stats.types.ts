/**
 * Parâmetros de consulta para obter estatísticas de envio de emails.
 */
export interface GetStatsQuery {
  /**
   * Filtra estatísticas por domínio de envio.
   */
  readonly domainId?: string;
  /**
   * Filtra estatísticas por tag de campanha.
   */
  readonly tag?: string;
  /**
   * Início do intervalo de datas para o filtro (ISO 8601).
   */
  readonly startDate?: string;
  /**
   * Fim do intervalo de datas para o filtro (ISO 8601).
   */
  readonly endDate?: string;
  /**
   * Agrupamento dos dados: dia, semana ou mês. Padrão: 'day'.
   */
  readonly granularity?: 'day' | 'week' | 'month';
  /**
   * Atalho para intervalo relativo (últimos 7/30/90 dias). Quando informado,
   * substitui startDate/endDate calculados pela API.
   */
  readonly period?: 'last7d' | 'last30d' | 'last90d';
}

/**
 * Ponto da série histórica de estatísticas agrupado por período.
 */
export interface StatsDataPoint {
  readonly period: string;
  readonly sent: number;
  readonly delivered: number;
  readonly bounced: number;
  readonly failed: number;
}

/**
 * Resumo consolidado de estatísticas de envio de emails.
 */
export interface StatsResponse {
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalBounced: number;
  readonly totalFailed: number;
  readonly data: ReadonlyArray<StatsDataPoint>;
}

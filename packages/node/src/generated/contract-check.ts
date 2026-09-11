/**
 * Checagem em tempo de compilação: garante que os tipos de resposta
 * escritos à mão em src/types/*.ts continuam compatíveis com o que a API
 * real promete no spec gerado (openapi.d.ts). Não existe código em runtime
 * aqui — é puramente `tsc --noEmit` (já parte de `npm run typecheck`/CI).
 *
 * Verificamos apenas RESPONSES, não requests: os payloads de entrada do SDK
 * são deliberadamente mais ergonômicos que o formato de rede (ex: anexos
 * aceitam `Uint8Array` no SDK, mas viajam como string base64) — uma checagem
 * rígida ali geraria alarme falso constante, não sinal de drift real.
 *
 * Direção do check: o que a API promete (`ApiType`) precisa satisfazer o que
 * o SDK promete ao consumidor (`OurType`) — se a API deixar de entregar um
 * campo que documentamos, isso quebra aqui. Campos extras na API não quebram
 * (são apenas ignorados pelo tipo do SDK).
 *
 * Se um destes `Assert<...>` falhar, NÃO relaxe o tipo do SDK sem entender
 * por quê — normalmente significa que o schema real mudou e o types/*.ts
 * correspondente precisa ser atualizado.
 */
import type { paths } from './openapi.js';
import type { AudienceDetail } from '../types/audiences.types.js';
import type { BroadcastDetail } from '../types/broadcasts.types.js';
import type { DomainDetail } from '../types/domains.types.js';
import type { EmailDetail } from '../types/emails.types.js';
import type { StatsResponse } from '../types/stats.types.js';
import type { SuppressionDetail } from '../types/suppressions.types.js';
import type { TemplateDetail } from '../types/templates.types.js';
import type { WebhookDetail } from '../types/webhooks.types.js';

type Assert<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;

type Json200<Path extends keyof paths, Method extends keyof paths[Path]> = paths[Path][Method] extends {
  responses: { 200: { content: { 'application/json': infer R } } };
}
  ? R
  : never;

export type _CheckEmailDetail = Assert<Extends<Json200<'/v1/product/emails/{id}', 'get'>, EmailDetail>>;
export type _CheckDomainDetail = Assert<Extends<Json200<'/v1/product/domains/{id}', 'get'>, DomainDetail>>;
export type _CheckTemplateDetail = Assert<Extends<Json200<'/v1/product/templates/{id}', 'get'>, TemplateDetail>>;
export type _CheckAudienceDetail = Assert<Extends<Json200<'/v1/product/audiences/{id}', 'get'>, AudienceDetail>>;
export type _CheckBroadcastDetail = Assert<Extends<Json200<'/v1/product/broadcasts/{id}', 'get'>, BroadcastDetail>>;
export type _CheckWebhookDetail = Assert<Extends<Json200<'/v1/product/webhooks/{id}', 'get'>, WebhookDetail>>;
export type _CheckSuppressionDetail = Assert<Extends<Json200<'/v1/product/suppressions/{id}', 'get'>, SuppressionDetail>>;
export type _CheckStatsResponse = Assert<Extends<Json200<'/v1/product/stats', 'get'>, StatsResponse>>;

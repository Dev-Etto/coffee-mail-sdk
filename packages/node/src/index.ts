export const COFFEEMAIL_VERSION = '0.1.0';

export { CoffeeMail } from './client.js';

export {
  CoffeeMailError,
  ValidationError,
  AuthenticationError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError,
  InternalServerError,
} from './core/errors.js';

export type {
  CoffeeMailClientOptions,
  CoffeeMailResponse,
} from './core/types.js';

export type { CoffeeMailLocale } from './core/i18n/types.js';

export { Emails } from './resources/emails.js';
export { Domains } from './resources/domains.js';
export { Templates } from './resources/templates.js';
export { Audiences, Contacts } from './resources/audiences.js';
export { Broadcasts } from './resources/broadcasts.js';
export { Suppressions } from './resources/suppressions.js';
export { Webhooks } from './resources/webhooks.js';
export { Stats } from './resources/stats.js';

export type {
  EmailAddressInput,
  EmailParticipant,
  EmailAttachment,
  EmailTag,
  SendEmailPayload,
  SendEmailResponse,
  EmailDetail,
  ListEmailsQuery,
  ListEmailsResponse,
  EmailTimelineEvent,
  EmailEventsResponse,
} from './types/emails.types.js';

export type {
  DomainDnsRecord,
  DomainDetail,
  CreateDomainPayload,
  VerifyDomainResponse,
  DomainHealthResponse,
} from './types/domains.types.js';

export type {
  TemplateDetail,
  CreateTemplatePayload,
  RenderPreviewPayload,
  RenderPreviewResponse,
} from './types/templates.types.js';

export type {
  ContactDetail,
  CreateContactPayload,
  AudienceDetail,
  CreateAudiencePayload,
} from './types/audiences.types.js';

export type {
  BroadcastDetail,
  CreateBroadcastPayload,
} from './types/broadcasts.types.js';

export type {
  SuppressionDetail,
  CheckSuppressionResponse,
  CreateSuppressionPayload,
} from './types/suppressions.types.js';

export type {
  WebhookEventType,
  WebhookDetail,
  CreateWebhookPayload,
  VerifyWebhookSignatureOptions,
} from './types/webhooks.types.js';

export type {
  StatsOverviewResponse,
  StatsDeliveryResponse,
} from './types/stats.types.js';

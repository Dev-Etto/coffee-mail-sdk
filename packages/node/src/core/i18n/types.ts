export type CoffeeMailLocale = "pt-BR" | "en";

export interface I18nMessages {
  readonly missingApiKey: string;
  readonly requestTimeout: string;
  readonly networkError: string;
  readonly unexpectedError: string;
  readonly invalidJson: string;
  readonly rateLimitExceeded: string;
  readonly permissionDenied: string;
}

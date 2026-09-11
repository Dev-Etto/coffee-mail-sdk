import type { I18nMessages } from "./types.js";

export const enMessages: I18nMessages = {
  missingApiKey:
    "API key was not provided. Please pass a valid API key (e.g. cm_live_...) to the CoffeeMail constructor.",
  requestTimeout: "The request timed out after {timeoutMs}ms.",
  networkError:
    "Network error while attempting to communicate with CoffeeMail API: {details}",
  unexpectedError:
    "An unexpected error occurred while communicating with CoffeeMail API.",
  invalidJson: "The server response could not be parsed as valid JSON.",
  rateLimitExceeded: "Rate limit exceeded. Please retry in a few moments.",
};

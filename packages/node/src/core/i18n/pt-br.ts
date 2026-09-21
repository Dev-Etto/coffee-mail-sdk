import type { I18nMessages } from "./types.js";

export const ptBrMessages: I18nMessages = {
  missingApiKey:
    "A chave de API não foi informada. Forneça uma chave válida (ex: cm_live_...) no construtor do CoffeeMail.",
  requestTimeout:
    "A requisição excedeu o tempo limite configurado de {timeoutMs}ms.",
  networkError:
    "Falha de rede ao tentar se comunicar com os servidores do CoffeeMail: {details}",
  unexpectedError:
    "Ocorreu um erro inesperado durante a comunicação com a API do CoffeeMail.",
  invalidJson:
    "A resposta do servidor não pôde ser interpretada como JSON válido.",
  rateLimitExceeded:
    "Limite de requisições excedido (Rate Limit). Tente novamente em alguns segundos.",
  permissionDenied:
    "Esta chave de API não possui a permissão necessária ({requiredPermission}) para executar esta operação. Crie uma chave com permissão 'full_access' no dashboard.",
};

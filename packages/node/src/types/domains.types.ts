/**
 * Registro DNS exigido para autenticação do domínio (SPF, DKIM, DMARC, Ownership).
 */
export interface DomainDnsRecord {
  /**
   * Tipo do registro DNS (TXT, CNAME, MX).
   */
  readonly type: 'TXT' | 'CNAME' | 'MX';
  /**
   * Nome da entrada / Hostname (ex: coffeemail._domainkey.seudominio.com).
   */
  readonly name: string;
  /**
   * Conteúdo do registro / Valor a ser inserido no painel de DNS.
   */
  readonly value: string;
  /**
   * Prioridade (usado apenas em registros MX).
   */
  readonly priority?: number;
  /**
   * Tempo de vida do cache DNS (TTL).
   */
  readonly ttl?: number;
  /**
   * Status de validação deste registro específico.
   */
  readonly status: 'verified' | 'pending' | 'failed';
}

/**
 * Detalhes de um domínio cadastrado na organização.
 */
export interface DomainDetail {
  /**
   * Identificador único do domínio no CoffeeMail.
   */
  readonly id: string;
  /**
   * Nome do domínio cadastrado (ex: meudominio.com.br).
   */
  readonly name: string;
  /**
   * Status de verificação do domínio.
   */
  readonly status: 'verified' | 'pending' | 'failed';
  /**
   * Data e hora da verificação com sucesso.
   */
  readonly verifiedAt?: string | null;
  /**
   * Lista de registros DNS gerados para configuração no provedor DNS.
   */
  readonly records?: ReadonlyArray<DomainDnsRecord>;
  /**
   * Data de criação do cadastro do domínio.
   */
  readonly createdAt: string;
}

/**
 * Parâmetros para adicionar um novo domínio à organização.
 */
export interface CreateDomainPayload {
  /**
   * Nome completo do domínio a ser cadastrado (ex: "empresa.com.br" ou "mail.empresa.com.br").
   */
  readonly name: string;
}

/**
 * Resultado da verificação sob demanda de um domínio.
 */
export interface VerifyDomainResponse {
  readonly id: string;
  readonly name: string;
  readonly status: 'verified' | 'failed';
  readonly verifiedAt?: string | null;
  readonly checks: {
    readonly spf: { readonly ok: boolean; readonly reason?: string };
    readonly dkim: { readonly ok: boolean; readonly reason?: string };
    readonly dmarc: { readonly ok: boolean; readonly reason?: string };
    readonly ownership: { readonly ok: boolean; readonly reason?: string };
  };
}

/**
 * Diagnóstico de saúde e entregabilidade do domínio.
 */
export interface DomainHealthResponse {
  readonly id: string;
  readonly domain: string;
  readonly score: number;
  readonly blacklistCount: number;
  readonly recommendations: ReadonlyArray<string>;
}

import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  CreateDomainPayload,
  CreateDomainResponse,
  DeleteDomainResponse,
  DomainDetail,
  DomainHealthResponse,
  DomainWarmupStatus,
  ListDomainsResponse,
  VerifyDomainResponse,
} from '../types/domains.types.js';

/**
 * Recurso de gerenciamento e verificação de domínios na plataforma CoffeeMail.
 */
export class Domains {
  constructor(private readonly http: HttpClient) {}

  /**
   * Adiciona um novo domínio à sua organização e gera as entradas DNS necessárias (SPF, DKIM, DMARC).
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.create({
   *   name: 'empresa.com.br'
   * });
   * if (data) {
   *   console.log('Insira estes registros no seu provedor de DNS:', data.dkimRecordsToPublish);
   * }
   * ```
   */
  public async create(payload: CreateDomainPayload): Promise<CoffeeMailResponse<CreateDomainResponse>> {
    return this.http.post<CreateDomainResponse>('/v1/product/domains', payload);
  }

  /**
   * Lista todos os domínios pertencentes à organização autenticada.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.list();
   * console.log(data?.domains);
   * ```
   */
  public async list(): Promise<CoffeeMailResponse<ListDomainsResponse>> {
    return this.http.get<ListDomainsResponse>('/v1/product/domains');
  }

  /**
   * Obtém detalhes e entradas DNS pendentes de um domínio específico pelo ID.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.get('dom_123');
   * ```
   */
  public async get(id: string): Promise<CoffeeMailResponse<DomainDetail>> {
    return this.http.get<DomainDetail>(`/v1/product/domains/${id}`);
  }

  /**
   * Dispara a verificação das entradas DNS do domínio nos servidores globais de nomes.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.verify('dom_123');
   * if (data?.status === 'verified') {
   *   console.log('Domínio pronto para envio!');
   * }
   * ```
   */
  public async verify(id: string): Promise<CoffeeMailResponse<VerifyDomainResponse>> {
    return this.http.post<VerifyDomainResponse>(`/v1/product/domains/${id}/verify`);
  }

  /**
   * Remove um domínio da organização.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.delete('dom_123');
   * ```
   */
  public async delete(id: string): Promise<CoffeeMailResponse<DeleteDomainResponse>> {
    return this.http.delete<DeleteDomainResponse>(`/v1/product/domains/${id}`);
  }

  /**
   * Executa um diagnóstico em tempo real de SPF/DKIM/DMARC do domínio.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.getHealth('dom_123');
   * ```
   */
  public async getHealth(id: string): Promise<CoffeeMailResponse<DomainHealthResponse>> {
    return this.http.post<DomainHealthResponse>(`/v1/product/domains/${id}/health`);
  }

  /**
   * Consulta o progresso do aquecimento (warmup) de IP/domínio.
   *
   * @example
   * ```typescript
   * const { data, error } = await coffeemail.domains.getWarmupStatus('dom_123');
   * ```
   */
  public async getWarmupStatus(id: string): Promise<CoffeeMailResponse<DomainWarmupStatus | null>> {
    return this.http.get<DomainWarmupStatus | null>(`/v1/product/domains/${id}/warmup`);
  }
}

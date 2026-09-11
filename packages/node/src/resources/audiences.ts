import type { HttpClient } from "../core/http-client.js";
import type { CoffeeMailResponse } from "../core/types.js";
import type {
  AudienceDetail,
  BulkAddContactsPayload,
  BulkAddContactsResult,
  ContactDetail,
  CreateAudiencePayload,
  CreateContactPayload,
  ListAudiencesResponse,
  ListContactsResponse,
  UpdateAudiencePayload,
  UpdateAudienceResult,
  UpdateContactPayload,
  UpdateContactResult,
} from "../types/audiences.types.js";

export class Contacts {
  constructor(private readonly http: HttpClient) {}

  public async create(
    audienceId: string,
    payload: CreateContactPayload,
  ): Promise<CoffeeMailResponse<ContactDetail>> {
    return this.http.post<ContactDetail>(
      `/v1/product/audiences/${audienceId}/contacts`,
      payload,
    );
  }

  public async list(
    audienceId: string,
    query?: { limit?: number; offset?: number },
  ): Promise<CoffeeMailResponse<ListContactsResponse>> {
    return this.http.get<ListContactsResponse>(
      `/v1/product/audiences/${audienceId}/contacts`,
      query,
    );
  }

  /**
   * Adiciona até 10.000 contatos de uma vez a uma audiência.
   */
  public async bulkAdd(
    audienceId: string,
    payload: BulkAddContactsPayload,
  ): Promise<CoffeeMailResponse<BulkAddContactsResult>> {
    return this.http.post<BulkAddContactsResult>(
      `/v1/product/audiences/${audienceId}/contacts/bulk`,
      payload,
    );
  }

  public async update(
    audienceId: string,
    contactId: string,
    payload: UpdateContactPayload,
  ): Promise<CoffeeMailResponse<UpdateContactResult>> {
    return this.http.put<UpdateContactResult>(
      `/v1/product/audiences/${audienceId}/contacts/${contactId}`,
      payload,
    );
  }

  /**
   * Remove um contato da audiência. Não retorna corpo na resposta (204 No Content).
   */
  public async delete(
    audienceId: string,
    contactId: string,
  ): Promise<CoffeeMailResponse<void>> {
    return this.http.delete<void>(
      `/v1/product/audiences/${audienceId}/contacts/${contactId}`,
    );
  }
}

export class Audiences {
  public readonly contacts: Contacts;

  constructor(private readonly http: HttpClient) {
    this.contacts = new Contacts(http);
  }

  public async create(
    payload: CreateAudiencePayload,
  ): Promise<CoffeeMailResponse<AudienceDetail>> {
    return this.http.post<AudienceDetail>("/v1/product/audiences", payload);
  }

  public async list(query?: {
    limit?: number;
    offset?: number;
  }): Promise<CoffeeMailResponse<ListAudiencesResponse>> {
    return this.http.get<ListAudiencesResponse>("/v1/product/audiences", query);
  }

  public async get(id: string): Promise<CoffeeMailResponse<AudienceDetail>> {
    return this.http.get<AudienceDetail>(`/v1/product/audiences/${id}`);
  }

  public async update(
    id: string,
    payload: UpdateAudiencePayload,
  ): Promise<CoffeeMailResponse<UpdateAudienceResult>> {
    return this.http.put<UpdateAudienceResult>(
      `/v1/product/audiences/${id}`,
      payload,
    );
  }

  /**
   * Remove a audiência e seus contatos. Não retorna corpo na resposta (204 No Content).
   */
  public async delete(id: string): Promise<CoffeeMailResponse<void>> {
    return this.http.delete<void>(`/v1/product/audiences/${id}`);
  }
}

import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  AudienceDetail,
  ContactDetail,
  CreateAudiencePayload,
  CreateContactPayload,
} from '../types/audiences.types.js';

export class Contacts {
  constructor(private readonly http: HttpClient) {}

  public async create(
    audienceId: string,
    payload: CreateContactPayload
  ): Promise<CoffeeMailResponse<ContactDetail>> {
    return this.http.post<ContactDetail>(`/v1/product/audiences/${audienceId}/contacts`, payload);
  }

  public async list(
    audienceId: string,
    query?: { limit?: number; offset?: number }
  ): Promise<CoffeeMailResponse<ReadonlyArray<ContactDetail>>> {
    return this.http.get<ReadonlyArray<ContactDetail>>(
      `/v1/product/audiences/${audienceId}/contacts`,
      query
    );
  }

  public async delete(
    audienceId: string,
    contactId: string
  ): Promise<CoffeeMailResponse<{ readonly id: string; readonly deleted: boolean }>> {
    return this.http.delete<{ readonly id: string; readonly deleted: boolean }>(
      `/v1/product/audiences/${audienceId}/contacts/${contactId}`
    );
  }
}

export class Audiences {
  public readonly contacts: Contacts;

  constructor(private readonly http: HttpClient) {
    this.contacts = new Contacts(http);
  }

  public async create(payload: CreateAudiencePayload): Promise<CoffeeMailResponse<AudienceDetail>> {
    return this.http.post<AudienceDetail>('/v1/product/audiences', payload);
  }

  public async list(): Promise<CoffeeMailResponse<ReadonlyArray<AudienceDetail>>> {
    return this.http.get<ReadonlyArray<AudienceDetail>>('/v1/product/audiences');
  }

  public async get(id: string): Promise<CoffeeMailResponse<AudienceDetail>> {
    return this.http.get<AudienceDetail>(`/v1/product/audiences/${id}`);
  }

  public async delete(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly deleted: boolean }>> {
    return this.http.delete<{ readonly id: string; readonly deleted: boolean }>(`/v1/product/audiences/${id}`);
  }
}

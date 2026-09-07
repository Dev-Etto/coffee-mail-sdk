export interface ContactDetail {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly metadata?: Record<string, unknown>;
  readonly unsubscribed: boolean;
  readonly createdAt: string;
}

export interface CreateContactPayload {
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AudienceDetail {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly contactsCount?: number;
  readonly createdAt: string;
}

export interface CreateAudiencePayload {
  readonly name: string;
  readonly description?: string;
}

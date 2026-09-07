export interface SuppressionDetail {
  readonly id: string;
  readonly email: string;
  readonly reason: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual';
  readonly category: 'transactional' | 'broadcast' | 'global';
  readonly createdAt: string;
}

export interface CheckSuppressionResponse {
  readonly isSuppressed: boolean;
  readonly reason?: string;
  readonly category?: string;
}

export interface CreateSuppressionPayload {
  readonly email: string;
  readonly reason?: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual';
  readonly category?: 'transactional' | 'broadcast' | 'global';
}

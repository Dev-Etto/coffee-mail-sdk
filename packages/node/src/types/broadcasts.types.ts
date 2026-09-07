export interface BroadcastDetail {
  readonly id: string;
  readonly audienceId: string;
  readonly templateId?: string;
  readonly subject: string;
  readonly fromEmail: string;
  readonly replyTo?: string;
  readonly status: 'draft' | 'sending' | 'sent' | 'cancelled';
  readonly recipientsTotal: number;
  readonly recipientsQueued: number;
  readonly recipientsFailed: number;
  readonly scheduledAt?: string | null;
  readonly sentAt?: string | null;
  readonly createdAt: string;
}

export interface CreateBroadcastPayload {
  readonly audienceId: string;
  readonly fromEmail: string;
  readonly subject?: string;
  readonly templateId?: string;
  readonly html?: string;
  readonly text?: string;
  readonly replyTo?: string;
  readonly scheduledAt?: Date | string;
  readonly variables?: Record<string, unknown>;
}

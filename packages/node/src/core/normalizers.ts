/**
 * Converte `scheduledAt` (Date | string | undefined) em string ISO 8601 ou undefined.
 * Compartilhado entre resources que aceitam agendamento (emails, broadcasts).
 */
export const normalizeScheduledAt = (
  value: Date | string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

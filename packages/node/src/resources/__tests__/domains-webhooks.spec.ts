import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../../core/http-client.js';
import { Domains } from '../domains.js';
import { Webhooks } from '../webhooks.js';

describe('Domains & Webhooks', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let domains: Domains;
  let webhooks: Webhooks;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient('cm_live_teste123', { fetch: mockFetch });
    domains = new Domains(client);
    webhooks = new Webhooks(client);
  });

  describe('Domains', () => {
    it('deve disparar verificação de domínio com URL correta', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            id: 'dom_123',
            name: 'empresa.com.br',
            status: 'verified',
            checks: { spf: { ok: true }, dkim: { ok: true }, dmarc: { ok: true }, ownership: { ok: true } },
          }),
      });

      const { data, error } = await domains.verify('dom_123');

      expect(error).toBeNull();
      expect(data?.status).toBe('verified');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coffeemail.com/v1/product/domains/dom_123/verify',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('Webhooks', () => {
    const secret = 'whsec_meu_segredo_super_seguro';
    const payload = JSON.stringify({ event: 'email.delivered', id: 'eml_123' });

    it('deve validar assinatura HMAC-SHA256 válida corretamente', () => {
      const validSignature = createHmac('sha256', secret).update(payload).digest('hex');

      const isValid = webhooks.verifySignature({
        payload,
        signature: validSignature,
        secret,
      });

      expect(isValid).toBe(true);
    });

    it('deve rejeitar assinatura HMAC-SHA256 incorreta', () => {
      const isValid = webhooks.verifySignature({
        payload,
        signature: 'assinatura_adulterada_ou_falsa',
        secret,
      });

      expect(isValid).toBe(false);
    });
  });
});

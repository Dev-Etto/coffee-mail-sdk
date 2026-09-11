import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../../core/http-client.js';
import { Audiences } from '../audiences.js';
import { Domains } from '../domains.js';
import { Stats } from '../stats.js';
import { Suppressions } from '../suppressions.js';
import { Templates } from '../templates.js';
import { Webhooks } from '../webhooks.js';

/**
 * Regressão para os métodos que apontavam para URLs/métodos HTTP inexistentes
 * na API real (templates.preview, stats.get, domains.getHealth) ou que
 * assumiam um corpo de resposta que a API nunca envia (delete/cancel com 204).
 */
describe('wire contract regression', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient('cm_live_teste123', { fetch: mockFetch });
  });

  const jsonResponse = (body: unknown, status = 200) => ({
    ok: status < 400,
    status,
    text: async () => JSON.stringify(body),
  });

  const noContentResponse = () => ({
    ok: true,
    status: 204,
    text: async () => '',
  });

  it('templates.preview atinge /templates/preview (não /templates/render-preview)', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ html: '<h1>Oi Maria</h1>', text: 'Oi Maria' }));

    const templates = new Templates(client);
    const { data, error } = await templates.preview({ html: '<h1>Oi {{name}}</h1>', variables: { name: 'Maria' } });

    expect(error).toBeNull();
    expect(data).toEqual({ html: '<h1>Oi Maria</h1>', text: 'Oi Maria' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/templates/preview',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('templates.update usa PATCH (não PUT)', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 'tpl_123' }));

    const templates = new Templates(client);
    await templates.update('tpl_123', { isActive: false });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/templates/tpl_123',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('templates.delete não tenta parsear corpo em uma resposta 204', async () => {
    mockFetch.mockResolvedValue(noContentResponse());

    const templates = new Templates(client);
    const { data, error } = await templates.delete('tpl_123');

    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('stats.get atinge /stats (não /stats/overview ou /stats/delivery)', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ totalSent: 10, totalDelivered: 8, totalBounced: 1, totalFailed: 1, data: [] })
    );

    const stats = new Stats(client);
    const { data, error } = await stats.get({ period: 'last30d' });

    expect(error).toBeNull();
    expect(data?.totalSent).toBe(10);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.coffeemail.com/v1/product/stats?'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('suppressions.list retorna o envelope { suppressions, nextCursor }, não um array bruto', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ suppressions: [{ id: 's_1' }], nextCursor: null }));

    const suppressions = new Suppressions(client);
    const { data, error } = await suppressions.list();

    expect(error).toBeNull();
    expect(data?.suppressions).toHaveLength(1);
    expect(data?.nextCursor).toBeNull();
  });

  it('suppressions.reactivate atinge /reactivate e aceita resposta 204', async () => {
    mockFetch.mockResolvedValue(noContentResponse());

    const suppressions = new Suppressions(client);
    const { error } = await suppressions.reactivate('sup_123');

    expect(error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/suppressions/sup_123/reactivate',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('domains.getHealth usa POST (não GET)', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        domainId: 'dom_123',
        domain: 'empresa.com.br',
        status: 'healthy',
        spf: { ok: true, expected: 'v=spf1', got: 'v=spf1' },
        dkim: { ok: true, expected: 'x', got: 'x' },
        dmarc: { ok: true, expected: 'y', got: 'y' },
        checkedAt: '2026-01-01T00:00:00.000Z',
      })
    );

    const domains = new Domains(client);
    await domains.getHealth('dom_123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/domains/dom_123/health',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('webhooks.delete e webhooks.toggle usam os métodos/paths corretos', async () => {
    const webhooks = new Webhooks(client);

    mockFetch.mockResolvedValue(noContentResponse());
    const { error: deleteError } = await webhooks.delete('wh_123');
    expect(deleteError).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/webhooks/wh_123',
      expect.objectContaining({ method: 'DELETE' })
    );

    mockFetch.mockResolvedValue(jsonResponse({ id: 'wh_123', status: 'paused' }));
    await webhooks.toggle('wh_123', { status: 'paused' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coffeemail.com/v1/product/webhooks/wh_123',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('audiences.list retorna o envelope { audiences, total }, não um array bruto', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ audiences: [{ id: 'aud_1' }], total: 1 }));

    const audiences = new Audiences(client);
    const { data, error } = await audiences.list();

    expect(error).toBeNull();
    expect(data?.audiences).toHaveLength(1);
    expect(data?.total).toBe(1);
  });
});

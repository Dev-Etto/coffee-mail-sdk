import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../core/http-client.js";
import { Broadcasts } from "../broadcasts.js";
import type { ApiKeyIntrospection } from "../../core/types.js";

import type { BroadcastDetail } from "../../types/broadcasts.types.js";

describe("Broadcasts", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let broadcasts: Broadcasts;

  const FULL_ACCESS_INTROSPECTION: ApiKeyIntrospection = {
    id: "ak_1",
    name: "test",
    organisationId: "org_1",
    scopes: ["full_access"],
  };

  const mockIntrospection = (introspection: ApiKeyIntrospection) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(introspection),
    });
  };

  const mockOkThen = (payload: unknown) => {
    mockIntrospection(FULL_ACCESS_INTROSPECTION);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(payload),
    });
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    broadcasts = new Broadcasts(client);
  });

  const broadcastDetail: BroadcastDetail = {
    id: "bcast_123",
    audienceId: "aud_123",
    audienceName: "Clientes VIP",
    templateId: null,
    subject: "Promoção de Setembro",
    fromEmail: "contato@empresa.com.br",
    replyTo: null,
    status: "draft",
    scheduledAt: null,
    sentAt: null,
    cancelledAt: null,
    recipientsTotal: 0,
    recipientsQueued: 0,
    recipientsFailed: 0,
    createdAt: "2026-09-08T22:00:00.000Z",
    updatedAt: "2026-09-08T22:00:00.000Z",
  };

  describe("create", () => {
    it("deve criar campanha com sucesso usando html e subject", async () => {
      mockOkThen(broadcastDetail);

      const { data, error } = await broadcasts.create({
        audienceId: "aud_123",
        fromEmail: "contato@empresa.com.br",
        html: "<p>Promoção imperdível</p>",
        subject: "Promoção de Setembro",
      });

      expect(error).toBeNull();
      expect(data).toEqual(broadcastDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            audienceId: "aud_123",
            fromEmail: "contato@empresa.com.br",
            html: "<p>Promoção imperdível</p>",
            subject: "Promoção de Setembro",
          }),
        }),
      );
    });

    it("deve normalizar scheduledAt de Date para string ISO 8601 no body enviado", async () => {
      mockOkThen({
        ...broadcastDetail,
        status: "scheduled",
        scheduledAt: "2026-10-01T12:00:00.000Z",
      });

      const scheduledAt = new Date("2026-10-01T12:00:00.000Z");

      const { data, error } = await broadcasts.create({
        audienceId: "aud_123",
        fromEmail: "contato@empresa.com.br",
        templateId: "tpl_123",
        scheduledAt,
      });

      expect(error).toBeNull();
      expect(data?.status).toBe("scheduled");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            audienceId: "aud_123",
            fromEmail: "contato@empresa.com.br",
            templateId: "tpl_123",
            scheduledAt: "2026-10-01T12:00:00.000Z",
          }),
        }),
      );

      const [, init] = mockFetch.mock.calls[1] as [string, { body: string }];
      const sentBody = JSON.parse(init.body) as { scheduledAt: unknown };
      expect(sentBody.scheduledAt).toBe("2026-10-01T12:00:00.000Z");
      expect(typeof sentBody.scheduledAt).toBe("string");
    });

    it("deve retornar erro de validação quando payload é inválido", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            error: {
              code: "VALIDATION_ERROR",
              message: "É preciso fornecer templateId ou html, não ambos.",
            },
          }),
      });

      const { data, error } = await broadcasts.create({
        audienceId: "aud_123",
        fromEmail: "contato@empresa.com.br",
        templateId: "tpl_123",
      } as Parameters<typeof broadcasts.create>[0]);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(400);
      expect(error?.code).toBe("VALIDATION_ERROR");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("list", () => {
    it("deve listar campanhas sem filtros", async () => {
      const listResponse = { broadcasts: [broadcastDetail], nextCursor: null };
      mockOkThen(listResponse);

      const { data, error } = await broadcasts.list();

      expect(error).toBeNull();
      expect(data).toEqual(listResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve listar campanhas aplicando filtros como query string", async () => {
      const listResponse = {
        broadcasts: [broadcastDetail],
        nextCursor: "cursor_abc",
      };
      mockOkThen(listResponse);

      const { data, error } = await broadcasts.list({
        status: "sent",
        limit: 20,
        after: "cursor_xyz",
      });

      expect(error).toBeNull();
      expect(data).toEqual(listResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts?status=sent&limit=20&after=cursor_xyz",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve retornar erro quando a autenticação falha", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({
            error: { code: "UNAUTHORIZED", message: "Chave de API inválida." },
          }),
      });

      const { data, error } = await broadcasts.list();

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(401);
      expect(error?.code).toBe("UNAUTHORIZED");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts",
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  describe("get", () => {
    it("deve buscar campanha por id com sucesso", async () => {
      mockOkThen(broadcastDetail);

      const { data, error } = await broadcasts.get("bcast_123");

      expect(error).toBeNull();
      expect(data).toEqual(broadcastDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_123",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve retornar erro NOT_FOUND quando a campanha não existe", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Campanha não encontrada." },
          }),
      });

      const { data, error } = await broadcasts.get("bcast_inexistente");

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(404);
      expect(error?.code).toBe("NOT_FOUND");
      expect(error?.message).toBe("Campanha não encontrada.");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_inexistente",
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  describe("send", () => {
    it("deve disparar envio de campanha com sucesso", async () => {
      mockOkThen({
        id: "bcast_123",
        status: "sending",
        recipientsTotal: 1000,
        recipientsQueued: 1000,
      });

      const { data, error } = await broadcasts.send("bcast_123");

      expect(error).toBeNull();
      expect(data).toEqual({
        id: "bcast_123",
        status: "sending",
        recipientsTotal: 1000,
        recipientsQueued: 1000,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_123/send",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("deve retornar erro de conflito ao tentar enviar campanha já enviada", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({
            error: {
              code: "CONFLICT",
              message: "Campanha já foi enviada.",
            },
          }),
      });

      const { data, error } = await broadcasts.send("bcast_123");

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(409);
      expect(error?.code).toBe("CONFLICT");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_123/send",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("cancel", () => {
    it("deve cancelar campanha com sucesso", async () => {
      mockOkThen({
        id: "bcast_123",
        status: "cancelled",
        cancelledAt: "2026-09-14T10:00:00.000Z",
      });

      const { data, error } = await broadcasts.cancel("bcast_123");

      expect(error).toBeNull();
      expect(data).toEqual({
        id: "bcast_123",
        status: "cancelled",
        cancelledAt: "2026-09-14T10:00:00.000Z",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_123/cancel",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("deve retornar erro NOT_FOUND ao cancelar campanha inexistente", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Campanha não encontrada." },
          }),
      });

      const { data, error } = await broadcasts.cancel("bcast_inexistente");

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(404);
      expect(error?.code).toBe("NOT_FOUND");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/broadcasts/bcast_inexistente/cancel",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("permission gate", () => {
    const SENDING_INTROSPECTION: ApiKeyIntrospection = {
      id: "ak_sending",
      name: "transacional",
      organisationId: "org_1",
      scopes: ["sending_access"],
    };

    it("deve lançar PermissionError em create quando chave é sending_access", async () => {
      client.invalidateIntrospectionCache();
      mockIntrospection(SENDING_INTROSPECTION);

      const { data, error } = await broadcasts.create({
        audienceId: "aud_1",
        fromEmail: "c@e.com.br",
        html: "<p>x</p>",
        subject: "x",
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.name).toBe("PermissionError");
      expect(error?.code).toBe("PERMISSION_DENIED");
      expect(error?.status).toBe(0);
      const calledUrls = mockFetch.mock.calls.map(
        (c) => (c[0] as string) ?? "",
      );
      expect(
        calledUrls.some((u) => u.includes("/v1/product/broadcasts")),
      ).toBe(false);
    });

    it("deve lançar PermissionError em send quando chave é sending_access", async () => {
      client.invalidateIntrospectionCache();
      mockIntrospection(SENDING_INTROSPECTION);

      const { data, error } = await broadcasts.send("bcast_1");

      expect(data).toBeNull();
      expect(error?.name).toBe("PermissionError");
      expect(error?.requiredPermission).toBe("full_access");
    });

    it("deve prosseguir normalmente quando introspecção falha (modo conservador)", async () => {
      client.invalidateIntrospectionCache();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { code: "UNAUTHORIZED" } }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify(broadcastDetail),
      });

      const { data, error } = await broadcasts.create({
        audienceId: "aud_1",
        fromEmail: "c@e.com.br",
        html: "<p>x</p>",
        subject: "x",
      });

      expect(error).toBeNull();
      expect(data).toEqual(broadcastDetail);
    });

    it("deve cachear resultado da introspecção entre chamadas", async () => {
      mockIntrospection(FULL_ACCESS_INTROSPECTION);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ broadcasts: [], nextCursor: null }),
      });

      await broadcasts.list();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ broadcasts: [], nextCursor: null }),
      });
      await broadcasts.list();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      const introspectCalls = mockFetch.mock.calls.filter((c) =>
        (c[0] as string).includes("/auth/me/api-key"),
      );
      expect(introspectCalls).toHaveLength(1);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../core/http-client.js";
import { Suppressions } from "../suppressions.js";

describe("Suppressions", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let suppressions: Suppressions;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    suppressions = new Suppressions(client);
  });

  describe("get", () => {
    it("deve retornar o detalhe de uma supressão com sucesso", async () => {
      const suppressionDetail = {
        id: "sup_123",
        email: "cliente@gmail.com",
        reason: "bounce",
        source: "auto",
        category: "bounce",
        status: "active",
        expiresAt: null,
        createdAt: "2026-09-08T22:00:00.000Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(suppressionDetail),
      });

      const { data, error } = await suppressions.get("sup_123");

      expect(error).toBeNull();
      expect(data).toEqual(suppressionDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions/sup_123",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve retornar erro NOT_FOUND quando a supressão não existe", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Supressão não encontrada." },
          }),
      });

      const { data, error } = await suppressions.get("sup_inexistente");

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(404);
      expect(error?.code).toBe("NOT_FOUND");
      expect(error?.message).toBe("Supressão não encontrada.");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions/sup_inexistente",
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  describe("create", () => {
    it("deve criar uma supressão manual com sucesso", async () => {
      const suppressionDetail = {
        id: "sup_456",
        email: "descadastrar@empresa.com.br",
        reason: "manual",
        source: "manual",
        category: "manual",
        status: "active",
        expiresAt: null,
        createdAt: "2026-09-08T22:00:00.000Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(suppressionDetail),
      });

      const { data, error } = await suppressions.create({
        email: "descadastrar@empresa.com.br",
        reason: "manual",
      });

      expect(error).toBeNull();
      expect(data).toEqual(suppressionDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "descadastrar@empresa.com.br",
            reason: "manual",
          }),
        }),
      );
    });

    it("deve criar uma supressão com motivo 'bounce' e data de expiração", async () => {
      const suppressionDetail = {
        id: "sup_789",
        email: "bounce@empresa.com.br",
        reason: "bounce",
        source: "manual",
        category: "bounce",
        status: "active",
        expiresAt: "2026-12-31T23:59:59.000Z",
        createdAt: "2026-09-08T22:00:00.000Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(suppressionDetail),
      });

      const { data, error } = await suppressions.create({
        email: "bounce@empresa.com.br",
        reason: "bounce",
        expiresAt: "2026-12-31T23:59:59.000Z",
      });

      expect(error).toBeNull();
      expect(data).toEqual(suppressionDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "bounce@empresa.com.br",
            reason: "bounce",
            expiresAt: "2026-12-31T23:59:59.000Z",
          }),
        }),
      );
    });

    it("deve criar uma supressão com motivo 'complaint'", async () => {
      const suppressionDetail = {
        id: "sup_321",
        email: "reclamacao@empresa.com.br",
        reason: "complaint",
        source: "manual",
        category: "complaint",
        status: "active",
        expiresAt: null,
        createdAt: "2026-09-08T22:00:00.000Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(suppressionDetail),
      });

      const { data, error } = await suppressions.create({
        email: "reclamacao@empresa.com.br",
        reason: "complaint",
      });

      expect(error).toBeNull();
      expect(data).toEqual(suppressionDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "reclamacao@empresa.com.br",
            reason: "complaint",
          }),
        }),
      );
    });

    it("deve criar uma supressão sem informar 'reason' (opcional)", async () => {
      const suppressionDetail = {
        id: "sup_654",
        email: "sem-motivo@empresa.com.br",
        reason: "manual",
        source: "manual",
        category: "manual",
        status: "active",
        expiresAt: null,
        createdAt: "2026-09-08T22:00:00.000Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(suppressionDetail),
      });

      const { data, error } = await suppressions.create({
        email: "sem-motivo@empresa.com.br",
      });

      expect(error).toBeNull();
      expect(data).toEqual(suppressionDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "sem-motivo@empresa.com.br",
          }),
        }),
      );
    });

    it("deve retornar erro CONFLICT quando o e-mail já está suprimido", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({
            error: {
              code: "CONFLICT",
              message: "Este e-mail já está na lista de supressão.",
            },
          }),
      });

      const { data, error } = await suppressions.create({
        email: "ja-suprimido@empresa.com.br",
        reason: "manual",
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(409);
      expect(error?.code).toBe("CONFLICT");
      expect(error?.message).toBe("Este e-mail já está na lista de supressão.");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "ja-suprimido@empresa.com.br",
            reason: "manual",
          }),
        }),
      );
    });
  });

  describe("delete", () => {
    it("deve remover uma supressão definitivamente e aceitar resposta 204", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => "",
      });

      const { data, error } = await suppressions.delete("sup_123");

      expect(error).toBeNull();
      expect(data).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions/sup_123",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("deve retornar erro NOT_FOUND ao tentar remover supressão inexistente", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Supressão não encontrada." },
          }),
      });

      const { data, error } = await suppressions.delete("sup_inexistente");

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(404);
      expect(error?.code).toBe("NOT_FOUND");
      expect(error?.message).toBe("Supressão não encontrada.");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/suppressions/sup_inexistente",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});

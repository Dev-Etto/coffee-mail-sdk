import { describe, expect, it, vi } from "vitest";

import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "../errors.js";
import { HttpClient } from "../http-client.js";

describe("HttpClient", () => {
  it("deve lançar AuthenticationError se nenhuma apiKey for fornecida", () => {
    expect(() => new HttpClient("")).toThrow(AuthenticationError);
    expect(() => new HttpClient("   ")).toThrow(AuthenticationError);
  });

  it("deve injetar cabeçalhos padrão incluindo Authorization e Accept-Language pt-BR", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    });

    const client = new HttpClient("cm_live_teste123", {
      fetch: mockFetch,
      locale: "pt-BR",
    });

    const { data, error } = await client.get("/v1/product/test");

    expect(error).toBeNull();
    expect(data).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.coffeemail.com.br/v1/product/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer cm_live_teste123",
          "Accept-Language": "pt-BR",
        }),
      }),
    );
  });

  it("deve converter status 400 em ValidationError", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "E-mail de destinatário inválido",
          },
        }),
    });

    const client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    const { data, error } = await client.post("/v1/product/emails", {});

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error?.message).toBe("E-mail de destinatário inválido");
    expect(error?.status).toBe(400);
  });

  it("deve converter status 404 em NotFoundError", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () =>
        JSON.stringify({
          error: {
            code: "RESOURCE_NOT_FOUND",
            message: "Domínio não encontrado",
          },
        }),
    });

    const client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    const { data, error } = await client.get("/v1/product/domains/123");

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error?.status).toBe(404);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../core/http-client.js";
import { Emails } from "../emails.js";

describe("Emails", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let emails: Emails;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    emails = new Emails(client);
  });

  it("deve normalizar remetente e destinatário em strings simples para objetos esperados pela API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 202,
      text: async () =>
        JSON.stringify({
          id: "eml_123",
          status: "queued",
          queuedAt: "2026-09-08T22:00:00.000Z",
        }),
    });

    const { data, error } = await emails.send({
      from: "contato@empresa.com.br",
      to: "cliente@gmail.com",
      subject: "Teste de Envio",
      html: "<p>Olá mundo</p>",
    });

    expect(error).toBeNull();
    expect(data?.id).toBe("eml_123");
    expect(data?.status).toBe("queued");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.coffeemail.com/v1/product/emails",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          from: { email: "contato@empresa.com.br" },
          to: [{ email: "cliente@gmail.com" }],
          subject: "Teste de Envio",
          html: "<p>Olá mundo</p>",
        }),
      }),
    );
  });

  it("deve lidar com cancelamento de e-mail com sucesso", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: "eml_123", status: "cancelled" }),
    });

    const { data, error } = await emails.cancel("eml_123");

    expect(error).toBeNull();
    expect(data).toEqual({ id: "eml_123", status: "cancelled" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.coffeemail.com/v1/product/emails/eml_123/cancel",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

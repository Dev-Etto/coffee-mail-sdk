import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../core/http-client.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../core/errors.js";
import { Templates } from "../templates.js";

describe("Templates", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let templates: Templates;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    templates = new Templates(client);
  });

  const jsonResponse = (body: unknown, status = 200) => ({
    ok: status < 400,
    status,
    text: async () => JSON.stringify(body),
  });

  describe("create", () => {
    it("deve criar um template com alias, preheader e contentJson com POST correto", async () => {
      const templateDetail = {
        id: "tpl_123",
        organisationId: "org_1",
        name: "Boas-vindas",
        alias: "welcome-email",
        subject: "Bem-vindo!",
        preheader: "Ficamos felizes em ter você aqui",
        html: "<h1>Olá {{name}}</h1>",
        contentJson: { type: "doc", content: [] },
        textPayload: null,
        variables: [{ name: "name", description: "Nome do destinatário" }],
        isActive: true,
        format: "html",
        sourceLocale: "pt-BR",
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      };

      mockFetch.mockResolvedValue(jsonResponse(templateDetail));

      const payload = {
        name: "Boas-vindas",
        alias: "welcome-email",
        subject: "Bem-vindo!",
        preheader: "Ficamos felizes em ter você aqui",
        html: "<h1>Olá {{name}}</h1>",
        contentJson: { type: "doc", content: [] },
        variables: [{ name: "name", description: "Nome do destinatário" }],
      };

      const { data, error } = await templates.create(payload);

      expect(error).toBeNull();
      expect(data).toEqual(templateDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });

    it("deve converter erro 400 (payload inválido) em ValidationError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "O campo html é obrigatório",
            },
          },
          400,
        ),
      );

      const { data, error } = await templates.create({
        name: "Template inválido",
      } as never);

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.status).toBe(400);
      expect(error?.message).toBe("O campo html é obrigatório");
    });
  });

  describe("get", () => {
    it("deve buscar um template por id com GET correto", async () => {
      const templateDetail = {
        id: "tpl_123",
        organisationId: "org_1",
        name: "Boas-vindas",
        alias: "welcome",
        subject: "Bem-vindo!",
        preheader: null,
        html: "<h1>Olá {{name}}</h1>",
        contentJson: null,
        textPayload: null,
        variables: [],
        isActive: true,
        format: "html",
        sourceLocale: "pt-BR",
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      };

      mockFetch.mockResolvedValue(jsonResponse(templateDetail));

      const { data, error } = await templates.get("tpl_123");

      expect(error).toBeNull();
      expect(data).toEqual(templateDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/tpl_123",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve converter erro 404 (template inexistente) em NotFoundError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Template não encontrado",
            },
          },
          404,
        ),
      );

      const { data, error } = await templates.get("tpl_inexistente");

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error?.status).toBe(404);
    });
  });

  describe("list", () => {
    it("deve listar templates com GET correto e retornar o envelope { data }", async () => {
      const listResponse = {
        data: [
          {
            id: "tpl_123",
            organisationId: "org_1",
            name: "Boas-vindas",
            alias: "welcome",
            subject: "Bem-vindo!",
            preheader: null,
            html: "<h1>Olá</h1>",
            contentJson: null,
            textPayload: null,
            variables: [],
            isActive: true,
            format: "html",
            sourceLocale: "pt-BR",
            createdAt: "2026-09-01T00:00:00.000Z",
            updatedAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      };

      mockFetch.mockResolvedValue(jsonResponse(listResponse));

      const { data, error } = await templates.list();

      expect(error).toBeNull();
      expect(data?.data).toHaveLength(1);
      expect(data?.data[0]?.id).toBe("tpl_123");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve converter erro 401 (chave de API inválida) corretamente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "UNAUTHORIZED",
              message: "Chave de API inválida",
            },
          },
          401,
        ),
      );

      const { data, error } = await templates.list();

      expect(data).toBeNull();
      expect(error?.status).toBe(401);
    });
  });

  describe("format", () => {
    it("deve formatar o HTML de um template com POST correto", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ html: "<h1>\n  Olá {{name}}\n</h1>\n" }),
      );

      const payload = {
        html: "<h1>Olá {{name}}</h1>",
      };

      const { data, error } = await templates.format(payload);

      expect(error).toBeNull();
      expect(data).toEqual({ html: "<h1>\n  Olá {{name}}\n</h1>\n" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/format",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });

    it("deve converter erro 400 (HTML/JSX inválido) em ValidationError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "HTML malformado, não foi possível formatar",
            },
          },
          400,
        ),
      );

      const { data, error } = await templates.format({
        html: "<h1>Olá",
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.status).toBe(400);
    });
  });

  describe("testRender", () => {
    it("deve renderizar e sanitizar o HTML com POST correto", async () => {
      const testRenderResponse = {
        html: "<h1>Olá Maria</h1>",
        text: "Olá Maria",
        sanitizeReport: {
          scripts: 1,
          iframes: 0,
          javascriptHrefs: 0,
          eventHandlers: 2,
        },
      };

      mockFetch.mockResolvedValue(jsonResponse(testRenderResponse));

      const payload = {
        html: "<h1>Olá {{name}}</h1><script>alert(1)</script>",
        variables: { name: "Maria" },
      };

      const { data, error } = await templates.testRender(payload);

      expect(error).toBeNull();
      expect(data).toEqual(testRenderResponse);
      expect(data?.sanitizeReport.scripts).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/test-render",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });

    it("deve converter erro 400 (variáveis inválidas) em ValidationError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Variáveis fornecidas não correspondem ao template",
            },
          },
          400,
        ),
      );

      const { data, error } = await templates.testRender({
        html: "<h1>Olá {{name}}</h1>",
        variables: {},
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe("testSend", () => {
    it("deve enviar e-mail de teste com POST correto para /v1/product/templates/:id/test-send", async () => {
      const testSendResponse = {
        messageId: "msg_abc123",
        to: "developer@example.com",
        subject: "[TESTE] Bem-vindo Alice!",
        sentAt: "2026-09-01T00:00:00.000Z",
      };

      mockFetch.mockResolvedValue(jsonResponse(testSendResponse));

      const payload = {
        to: "developer@example.com",
        variables: { name: "Alice" },
      };

      const { data, error } = await templates.testSend("tpl_123", payload);

      expect(error).toBeNull();
      expect(data).toEqual(testSendResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/tpl_123/test-send",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });

    it("deve converter erro 404 (template não encontrado) em NotFoundError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Template não encontrado",
            },
          },
          404,
        ),
      );

      const { data, error } = await templates.testSend("tpl_inexistente", {
        to: "developer@example.com",
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error?.status).toBe(404);
    });
  });

  it("deve converter erro 409 (conflito de nome) em ConflictError no create", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "CONFLICT",
            message: "Já existe um template com esse nome",
          },
        },
        409,
      ),
    );

    const { data, error } = await templates.create({
      name: "Boas-vindas",
      html: "<h1>Olá</h1>",
    });

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(ConflictError);
    expect(error?.status).toBe(409);
  });
});

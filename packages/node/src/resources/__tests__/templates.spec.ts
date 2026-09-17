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
    it("deve criar um template a partir de HTML bruto com POST correto", async () => {
      const templateDetail = {
        id: "tpl_123",
        organisationId: "org_1",
        name: "Boas-vindas",
        subject: "Bem-vindo!",
        html: "<h1>Olá {{name}}</h1>",
        textPayload: null,
        variables: [{ name: "name", description: "Nome do destinatário" }],
        isActive: true,
        format: "html",
        sourceLocale: "pt-BR",
        starterSlug: null,
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      };

      mockFetch.mockResolvedValue(jsonResponse(templateDetail));

      const payload = {
        name: "Boas-vindas",
        subject: "Bem-vindo!",
        html: "<h1>Olá {{name}}</h1>",
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

    it("deve criar um template a partir de starterSlug com POST correto", async () => {
      const templateDetail = {
        id: "tpl_456",
        organisationId: "org_1",
        name: "Recibo",
        subject: "Seu recibo",
        html: "<h1>Recibo</h1>",
        textPayload: null,
        variables: [],
        isActive: true,
        format: "html",
        sourceLocale: "pt-BR",
        starterSlug: "receipt",
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      };

      mockFetch.mockResolvedValue(jsonResponse(templateDetail));

      const payload = {
        name: "Recibo",
        starterSlug: "receipt",
      };

      const { data, error } = await templates.create(payload);

      expect(error).toBeNull();
      expect(data?.starterSlug).toBe("receipt");
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
              message: "É preciso fornecer html ou starterSlug",
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
      expect(error?.message).toBe("É preciso fornecer html ou starterSlug");
    });
  });

  describe("get", () => {
    it("deve buscar um template por id com GET correto", async () => {
      const templateDetail = {
        id: "tpl_123",
        organisationId: "org_1",
        name: "Boas-vindas",
        subject: "Bem-vindo!",
        html: "<h1>Olá {{name}}</h1>",
        textPayload: null,
        variables: [],
        isActive: true,
        format: "html",
        sourceLocale: "pt-BR",
        starterSlug: null,
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
            subject: "Bem-vindo!",
            html: "<h1>Olá</h1>",
            textPayload: null,
            variables: [],
            isActive: true,
            format: "html",
            sourceLocale: "pt-BR",
            starterSlug: null,
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

  describe("listStarters", () => {
    it("deve listar templates iniciais com GET correto", async () => {
      const listStartersResponse = {
        data: [
          {
            slug: "welcome",
            format: "html",
            category: "transactional",
            name: "Boas-vindas",
            description: "Template de boas-vindas para novos usuários",
            defaultLocale: "pt-BR",
            availableLocales: ["pt-BR", "en-US"],
            variables: [
              {
                name: "userName",
                type: "string",
                fallbackValue: "Cliente",
                description: "Nome do usuário",
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValue(jsonResponse(listStartersResponse));

      const { data, error } = await templates.listStarters();

      expect(error).toBeNull();
      expect(data?.data).toHaveLength(1);
      expect(data?.data[0]?.slug).toBe("welcome");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/starters",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve converter erro 500 (falha interna) em erro com status correto", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Erro inesperado no servidor",
            },
          },
          500,
        ),
      );

      const { data, error } = await templates.listStarters();

      expect(data).toBeNull();
      expect(error?.status).toBe(500);
    });
  });

  describe("getStarter", () => {
    it("deve buscar um template inicial específico sem locale com GET correto", async () => {
      const starterDetail = {
        slug: "welcome",
        format: "html",
        category: "transactional",
        name: "Boas-vindas",
        description: "Template de boas-vindas para novos usuários",
        defaultLocale: "pt-BR",
        availableLocales: ["pt-BR", "en-US"],
        variables: [
          {
            name: "userName",
            type: "string",
            fallbackValue: "Cliente",
            description: "Nome do usuário",
          },
        ],
        locale: "pt-BR",
        subject: "Bem-vindo!",
        source: "<h1>Olá {{userName}}</h1>",
      };

      mockFetch.mockResolvedValue(jsonResponse(starterDetail));

      const { data, error } = await templates.getStarter("welcome");

      expect(error).toBeNull();
      expect(data).toEqual(starterDetail);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/starters/welcome",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve buscar um template inicial com locale explícito via query string", async () => {
      const starterDetail = {
        slug: "welcome",
        format: "html",
        category: "transactional",
        name: "Welcome",
        description: "Welcome template for new users",
        defaultLocale: "pt-BR",
        availableLocales: ["pt-BR", "en-US"],
        variables: [],
        locale: "en-US",
        subject: "Welcome!",
        source: "<h1>Hello {{userName}}</h1>",
      };

      mockFetch.mockResolvedValue(jsonResponse(starterDetail));

      const { data, error } = await templates.getStarter("welcome", "en-US");

      expect(error).toBeNull();
      expect(data?.locale).toBe("en-US");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com.br/v1/product/templates/starters/welcome?locale=en-US",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve converter erro 404 (starter/locale inexistente) em NotFoundError", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Template inicial não encontrado para o locale fr-FR",
            },
          },
          404,
        ),
      );

      const { data, error } = await templates.getStarter("welcome", "fr-FR");

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

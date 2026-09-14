import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../core/http-client.js";
import { NotFoundError, ValidationError } from "../../core/errors.js";
import { Audiences, Contacts } from "../audiences.js";

describe("Audiences & Contacts", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: HttpClient;
  let audiences: Audiences;
  let contacts: Contacts;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new HttpClient("cm_live_teste123", { fetch: mockFetch });
    audiences = new Audiences(client);
    contacts = new Contacts(client);
  });

  const jsonResponse = (body: unknown, status = 200) => ({
    ok: status < 400,
    status,
    text: async () => JSON.stringify(body),
  });

  const noContentResponse = () => ({
    ok: true,
    status: 204,
    text: async () => "",
  });

  describe("Audiences", () => {
    it("deve criar audiência com sucesso", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          id: "aud_123",
          name: "Newsletter",
          description: "Assinantes da newsletter",
          active: true,
          contactsCount: 0,
          createdAt: "2026-09-08T22:00:00.000Z",
          updatedAt: "2026-09-08T22:00:00.000Z",
        }),
      );

      const { data, error } = await audiences.create({
        name: "Newsletter",
        description: "Assinantes da newsletter",
      });

      expect(error).toBeNull();
      expect(data?.id).toBe("aud_123");
      expect(data?.name).toBe("Newsletter");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Newsletter",
            description: "Assinantes da newsletter",
          }),
        }),
      );
    });

    it("deve retornar ValidationError ao criar audiência sem nome", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "O campo name é obrigatório",
            },
          },
          400,
        ),
      );

      const { data, error } = await audiences.create({
        name: "",
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.status).toBe(400);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("deve buscar audiência por id com sucesso", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          id: "aud_123",
          name: "Newsletter",
          description: null,
          active: true,
          contactsCount: 42,
          createdAt: "2026-09-08T22:00:00.000Z",
          updatedAt: "2026-09-08T22:00:00.000Z",
        }),
      );

      const { data, error } = await audiences.get("aud_123");

      expect(error).toBeNull();
      expect(data?.id).toBe("aud_123");
      expect(data?.contactsCount).toBe(42);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve retornar NotFoundError ao buscar audiência inexistente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Audiência não encontrada",
            },
          },
          404,
        ),
      );

      const { data, error } = await audiences.get("aud_inexistente");

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error?.status).toBe(404);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_inexistente",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve atualizar audiência com sucesso", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: "aud_123" }));

      const { data, error } = await audiences.update("aud_123", {
        name: "Newsletter Atualizada",
        active: false,
      });

      expect(error).toBeNull();
      expect(data).toEqual({ id: "aud_123" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            name: "Newsletter Atualizada",
            active: false,
          }),
        }),
      );
    });

    it("deve retornar ValidationError ao atualizar audiência sem nenhum campo", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Ao menos um campo deve ser enviado",
            },
          },
          400,
        ),
      );

      const { data, error } = await audiences.update("aud_123", {});

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("deve remover audiência com sucesso (204 sem corpo)", async () => {
      mockFetch.mockResolvedValue(noContentResponse());

      const { data, error } = await audiences.delete("aud_123");

      expect(error).toBeNull();
      expect(data).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("deve retornar NotFoundError ao remover audiência inexistente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Audiência não encontrada",
            },
          },
          404,
        ),
      );

      const { data, error } = await audiences.delete("aud_inexistente");

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_inexistente",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("Contacts", () => {
    it("deve criar contato em uma audiência com sucesso", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          id: "con_123",
          email: "cliente@gmail.com",
          firstName: "Maria",
          lastName: null,
          metadata: {},
          createdAt: "2026-09-08T22:00:00.000Z",
        }),
      );

      const { data, error } = await contacts.create("aud_123", {
        email: "cliente@gmail.com",
        firstName: "Maria",
      });

      expect(error).toBeNull();
      expect(data?.id).toBe("con_123");
      expect(data?.email).toBe("cliente@gmail.com");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "cliente@gmail.com",
            firstName: "Maria",
          }),
        }),
      );
    });

    it("deve retornar ValidationError ao criar contato com e-mail inválido", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "E-mail inválido",
            },
          },
          400,
        ),
      );

      const { data, error } = await contacts.create("aud_123", {
        email: "invalido",
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("deve listar contatos de uma audiência com paginação por offset/limit na query string", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          contacts: [
            {
              id: "con_1",
              email: "cliente1@gmail.com",
              firstName: null,
              lastName: null,
              metadata: {},
              createdAt: "2026-09-08T22:00:00.000Z",
            },
          ],
          total: 1,
        }),
      );

      const { data, error } = await contacts.list("aud_123", {
        limit: 10,
        offset: 20,
      });

      expect(error).toBeNull();
      expect(data?.contacts).toHaveLength(1);
      expect(data?.total).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts?limit=10&offset=20",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve listar contatos sem query quando nenhum parâmetro de paginação é informado", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          contacts: [],
          total: 0,
        }),
      );

      const { data, error } = await contacts.list("aud_123");

      expect(error).toBeNull();
      expect(data?.total).toBe(0);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve retornar NotFoundError ao listar contatos de audiência inexistente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Audiência não encontrada",
            },
          },
          404,
        ),
      );

      const { data, error } = await contacts.list("aud_inexistente");

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_inexistente/contacts",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("deve adicionar contatos em massa com sucesso", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          inserted: 2,
          skipped: 1,
          errors: [{ email: "invalido@x", reason: "E-mail inválido" }],
        }),
      );

      const { data, error } = await audiences.contacts.bulkAdd("aud_123", {
        contacts: [
          { email: "cliente1@gmail.com" },
          { email: "cliente2@gmail.com" },
          { email: "invalido@x" },
        ],
      });

      expect(error).toBeNull();
      expect(data?.inserted).toBe(2);
      expect(data?.skipped).toBe(1);
      expect(data?.errors).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/bulk",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            contacts: [
              { email: "cliente1@gmail.com" },
              { email: "cliente2@gmail.com" },
              { email: "invalido@x" },
            ],
          }),
        }),
      );
    });

    it("deve retornar ValidationError ao adicionar contatos em massa acima do limite permitido", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Máximo de 10.000 contatos por requisição",
            },
          },
          400,
        ),
      );

      const { data, error } = await audiences.contacts.bulkAdd("aud_123", {
        contacts: [],
      });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(ValidationError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/bulk",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("deve atualizar contato com sucesso", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: "con_123" }));

      const { data, error } = await contacts.update("aud_123", "con_123", {
        firstName: "João",
        metadata: { plano: "pro" },
      });

      expect(error).toBeNull();
      expect(data).toEqual({ id: "con_123" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/con_123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            firstName: "João",
            metadata: { plano: "pro" },
          }),
        }),
      );
    });

    it("deve retornar NotFoundError ao atualizar contato inexistente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Contato não encontrado",
            },
          },
          404,
        ),
      );

      const { data, error } = await contacts.update(
        "aud_123",
        "con_inexistente",
        { firstName: "João" },
      );

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/con_inexistente",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("deve remover contato com sucesso (204 sem corpo)", async () => {
      mockFetch.mockResolvedValue(noContentResponse());

      const { data, error } = await contacts.delete("aud_123", "con_123");

      expect(error).toBeNull();
      expect(data).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/con_123",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("deve retornar NotFoundError ao remover contato inexistente", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Contato não encontrado",
            },
          },
          404,
        ),
      );

      const { data, error } = await contacts.delete(
        "aud_123",
        "con_inexistente",
      );

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.coffeemail.com/v1/product/audiences/aud_123/contacts/con_inexistente",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});

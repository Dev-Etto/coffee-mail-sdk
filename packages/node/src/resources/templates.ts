import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  CreateTemplatePayload,
  FormatTemplatePayload,
  FormatTemplateResponse,
  ListStartersResponse,
  ListTemplatesResponse,
  PreviewTemplatePayload,
  PreviewTemplateResponse,
  StarterDetail,
  TemplateDetail,
  TestRenderTemplatePayload,
  TestRenderTemplateResponse,
  UpdateTemplatePayload,
} from '../types/templates.types.js';

export class Templates {
  constructor(private readonly http: HttpClient) {}

  public async create(payload: CreateTemplatePayload): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.post<TemplateDetail>('/v1/product/templates', payload);
  }

  public async list(): Promise<CoffeeMailResponse<ListTemplatesResponse>> {
    return this.http.get<ListTemplatesResponse>('/v1/product/templates');
  }

  public async get(id: string): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.get<TemplateDetail>(`/v1/product/templates/${id}`);
  }

  public async update(
    id: string,
    payload: UpdateTemplatePayload
  ): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.patch<TemplateDetail>(`/v1/product/templates/${id}`, payload);
  }

  /**
   * Remove um template definitivamente. Não retorna corpo na resposta (204 No Content).
   */
  public async delete(id: string): Promise<CoffeeMailResponse<void>> {
    return this.http.delete<void>(`/v1/product/templates/${id}`);
  }

  /**
   * Renderiza HTML/JSX com variáveis, sem persistir nada. Não sanitiza o HTML
   * resultante — para conteúdo não confiável, use `testRender()`.
   */
  public async preview(payload: PreviewTemplatePayload): Promise<CoffeeMailResponse<PreviewTemplateResponse>> {
    return this.http.post<PreviewTemplateResponse>('/v1/product/templates/preview', payload);
  }

  /**
   * Formata o código-fonte de um template (HTML ou JSX) via Prettier, sem persistir nada.
   */
  public async format(payload: FormatTemplatePayload): Promise<CoffeeMailResponse<FormatTemplateResponse>> {
    return this.http.post<FormatTemplateResponse>('/v1/product/templates/format', payload);
  }

  /**
   * Renderiza com variáveis e sanitiza o HTML resultante (remove scripts,
   * iframes, links javascript: e handlers de evento inline).
   */
  public async testRender(
    payload: TestRenderTemplatePayload
  ): Promise<CoffeeMailResponse<TestRenderTemplateResponse>> {
    return this.http.post<TestRenderTemplateResponse>('/v1/product/templates/test-render', payload);
  }

  /**
   * Lista os templates iniciais prontos oferecidos pela plataforma.
   */
  public async listStarters(): Promise<CoffeeMailResponse<ListStartersResponse>> {
    return this.http.get<ListStartersResponse>('/v1/product/templates/starters');
  }

  /**
   * Busca um template inicial específico, com o código-fonte completo.
   */
  public async getStarter(slug: string, locale?: string): Promise<CoffeeMailResponse<StarterDetail>> {
    return this.http.get<StarterDetail>(
      `/v1/product/templates/starters/${slug}`,
      locale ? { locale } : undefined
    );
  }
}

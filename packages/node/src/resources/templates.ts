import type { HttpClient } from '../core/http-client.js';
import type { CoffeeMailResponse } from '../core/types.js';
import type {
  CreateTemplatePayload,
  RenderPreviewPayload,
  RenderPreviewResponse,
  TemplateDetail,
} from '../types/templates.types.js';

export class Templates {
  constructor(private readonly http: HttpClient) {}

  public async create(payload: CreateTemplatePayload): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.post<TemplateDetail>('/v1/product/templates', payload);
  }

  public async list(): Promise<CoffeeMailResponse<ReadonlyArray<TemplateDetail>>> {
    return this.http.get<ReadonlyArray<TemplateDetail>>('/v1/product/templates');
  }

  public async get(id: string): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.get<TemplateDetail>(`/v1/product/templates/${id}`);
  }

  public async update(
    id: string,
    payload: Partial<CreateTemplatePayload>
  ): Promise<CoffeeMailResponse<TemplateDetail>> {
    return this.http.put<TemplateDetail>(`/v1/product/templates/${id}`, payload);
  }

  public async delete(id: string): Promise<CoffeeMailResponse<{ readonly id: string; readonly deleted: boolean }>> {
    return this.http.delete<{ readonly id: string; readonly deleted: boolean }>(`/v1/product/templates/${id}`);
  }

  public async renderPreview(payload: RenderPreviewPayload): Promise<CoffeeMailResponse<RenderPreviewResponse>> {
    return this.http.post<RenderPreviewResponse>('/v1/product/templates/render-preview', payload);
  }
}

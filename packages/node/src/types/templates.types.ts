/**
 * Modelo de e-mail cadastrado na plataforma.
 */
export interface TemplateDetail {
  readonly id: string;
  readonly name: string;
  readonly subject?: string;
  readonly html?: string;
  readonly text?: string;
  readonly format?: 'handlebars' | 'react-email';
  readonly variables?: ReadonlyArray<{ readonly name: string; readonly defaultValue?: string }>;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface CreateTemplatePayload {
  readonly name: string;
  readonly subject?: string;
  readonly html?: string;
  readonly text?: string;
  readonly format?: 'handlebars' | 'react-email';
  readonly variables?: ReadonlyArray<{ readonly name: string; readonly defaultValue?: string }>;
}

export interface RenderPreviewPayload {
  readonly templateId?: string;
  readonly html?: string;
  readonly subject?: string;
  readonly format?: 'handlebars' | 'react-email';
  readonly variables?: Record<string, unknown>;
}

export interface RenderPreviewResponse {
  readonly html: string;
  readonly subject?: string;
}

export type TemplateFormat = "html" | "react";

export interface TemplateVariable {
  readonly name: string;
  readonly type?: "string" | "number" | "boolean" | "date" | "url" | "image";
  readonly fallbackValue?: string;
  readonly description?: string;
}

/**
 * Modelo de e-mail cadastrado na plataforma.
 */
export interface TemplateDetail {
  readonly id: string;
  readonly organisationId: string;
  readonly name: string;
  readonly alias: string | null;
  readonly subject: string | null;
  readonly preheader: string | null;
  readonly html: string;
  readonly contentJson: Record<string, unknown> | null;
  readonly textPayload: string | null;
  readonly variables: ReadonlyArray<TemplateVariable>;
  readonly isActive: boolean;
  readonly format: TemplateFormat;
  readonly sourceLocale: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListTemplatesResponse {
  readonly data: ReadonlyArray<TemplateDetail>;
}

/**
 * Payload para criar um template na plataforma ou no Playground.
 */
export interface CreateTemplatePayload {
  readonly name: string;
  readonly alias?: string | null;
  readonly subject?: string | null;
  readonly preheader?: string | null;
  readonly html: string;
  readonly contentJson?: Record<string, unknown> | null;
  readonly textPayload?: string | null;
  readonly variables?: ReadonlyArray<TemplateVariable>;
  readonly format?: TemplateFormat;
  readonly sourceLocale?: string;
}

/**
 * Atualização de template — todos os campos são independentes e opcionais.
 */
export interface UpdateTemplatePayload {
  readonly name?: string;
  readonly alias?: string | null;
  readonly subject?: string | null;
  readonly preheader?: string | null;
  readonly html?: string;
  readonly contentJson?: Record<string, unknown> | null;
  readonly textPayload?: string | null;
  readonly variables?: ReadonlyArray<TemplateVariable>;
  readonly format?: TemplateFormat;
  readonly isActive?: boolean;
  readonly sourceLocale?: string;
}

export interface PreviewTemplatePayload {
  readonly html: string;
  readonly format?: TemplateFormat;
  readonly variables?: Record<string, unknown>;
}

export interface PreviewTemplateResponse {
  readonly html: string;
  readonly text: string;
}

export interface FormatTemplatePayload {
  readonly html: string;
  readonly format?: TemplateFormat;
}

export interface FormatTemplateResponse {
  readonly html: string;
}

export interface TestRenderTemplatePayload {
  readonly html: string;
  readonly format?: TemplateFormat;
  readonly variables?: Record<string, unknown>;
}

/**
 * Resultado de `testRender()` — igual a `preview()`, mas com o HTML
 * sanitizado (scripts, iframes, links javascript: e handlers de evento
 * inline removidos) e um relatório do que foi removido.
 */
export interface TestRenderTemplateResponse {
  readonly html: string;
  readonly text: string;
  readonly sanitizeReport: {
    readonly scripts: number;
    readonly iframes: number;
    readonly javascriptHrefs: number;
    readonly eventHandlers: number;
  };
}

export interface TestSendTemplatePayload {
  readonly to: string;
  readonly variables?: Record<string, unknown>;
}

export interface TestSendTemplateResponse {
  readonly messageId: string;
  readonly to: string;
  readonly subject: string;
  readonly sentAt: string;
}

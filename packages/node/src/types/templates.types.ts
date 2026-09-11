export type TemplateFormat = "html" | "react";

export interface TemplateVariable {
  readonly name: string;
  readonly description?: string;
}

/**
 * Modelo de e-mail cadastrado na plataforma.
 */
export interface TemplateDetail {
  readonly id: string;
  readonly organisationId: string;
  readonly name: string;
  readonly subject: string | null;
  readonly html: string;
  readonly textPayload: string | null;
  readonly variables: ReadonlyArray<TemplateVariable>;
  readonly isActive: boolean;
  readonly format: TemplateFormat;
  readonly sourceLocale: string;
  readonly starterSlug: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListTemplatesResponse {
  readonly data: ReadonlyArray<TemplateDetail>;
}

interface CreateTemplateBase {
  readonly name: string;
  readonly subject?: string;
  readonly textPayload?: string;
  readonly variables?: ReadonlyArray<TemplateVariable>;
  readonly format?: TemplateFormat;
  readonly sourceLocale?: string;
}

/**
 * Payload para criar um template. É preciso fornecer exatamente um de
 * `html` ou `starterSlug` (a API rejeita ambos ou nenhum).
 */
export type CreateTemplatePayload =
  | (CreateTemplateBase & {
      readonly html: string;
      readonly starterSlug?: never;
    })
  | (CreateTemplateBase & {
      readonly starterSlug: string;
      readonly html?: never;
    });

/**
 * Atualização de template — todos os campos são independentes e opcionais,
 * sem a restrição de exclusividade de `create()`.
 */
export interface UpdateTemplatePayload {
  readonly name?: string;
  readonly subject?: string | null;
  readonly html?: string;
  readonly textPayload?: string | null;
  readonly variables?: ReadonlyArray<TemplateVariable>;
  readonly format?: TemplateFormat;
  readonly isActive?: boolean;
  readonly sourceLocale?: string;
  readonly starterSlug?: string | null;
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

export interface StarterVariable {
  readonly name: string;
  readonly type: "string" | "number" | "color";
  readonly fallbackValue?: string | number;
  readonly defaultColor?: string;
  readonly description?: string;
}

/**
 * Template inicial pronto oferecido pela plataforma (welcome, receipt, etc).
 */
export interface StarterManifest {
  readonly slug: string;
  readonly format: TemplateFormat;
  readonly category: "transactional" | "marketing";
  readonly name: string;
  readonly description: string;
  readonly defaultLocale: string;
  readonly availableLocales: ReadonlyArray<string>;
  readonly variables: ReadonlyArray<StarterVariable>;
}

export interface ListStartersResponse {
  readonly data: ReadonlyArray<StarterManifest>;
}

/**
 * Template inicial com o código-fonte completo, no idioma resolvido.
 */
export interface StarterDetail extends StarterManifest {
  readonly locale: string;
  readonly subject: string;
  readonly source: string;
}

import { ServerRequest } from "./deps.ts";

export type Renderer = (r: ServerRequest) => string;
export type PageModule = { head: Renderer, body: Renderer };

export function title(s: string): string {
  return `<title>${s}</title>`;
}

export function link(href: string, rel="stylesheet"): string {
  return `<link href="${href}" rel="${rel}">`;
}

export function h1(s: string): string {
  return `<h1>${s}</h1>`;
}


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

export function img(src: string): string {
  return `<img src="${src}">`;
}

export function div(content: string, className = ""): string {
  return `<div class="${className}">${content}</div>`;
}

export function main(content: string): string {
  return `<main>${content}</div>`;
}

export function a(href: string, content: string): string {
  return `<a href="${href}">${content}</a>`;
}

/** StudyCities Specific */

export function scHead(pageTitle: string): string {
  return `
  <title>SPX StudyCties - ${pageTitle}</title>
  <meta charset="UTF-8">
  <link href="/res/logo.gif" rel="icon">
  <link href="/res/studycities.css" rel="stylesheet">
  `;
}

export function scHeadKatex(): string {
  return `
  <link href="/res/katex.min.css" rel="stylesheet">
  <script defer src="/res/katex.min.js"></script>
  <script defer src="/res/katex-auto-render.js" onload="renderMathInElement(document.body)"></script>
  `;
}

export function scHeader(anchors: {content: string, href: string}[], tree = false): string {
  return (
    "<header>"
    +img("/res/logo.svg")
    +h1("The StudyCities Project")
    +div(((o:string)=>(anchors.forEach(v=>o+=a(v.href,v.content)),o))(""), tree?"tree":"")
    +"</header>"
  );
}

export function toc(anchors: {content: string, href: string}[]) {
  return (
    "<section>"
    +((o:string)=>(anchors.forEach(v=>o+=a(v.href,v.content)),o))("")
    +"</section>"
  )
}

export function article(title: string, content: string): string {
  return (
    "<article>"
    +h1(title)
    +content
    +"</article>"
  );
}

export function math(katex: string): string {
  return `\\(${katex}\\)`;
}

export function vec(variable: string) {
  return `\\utilde{${variable}}`;
}

export function hat(variable: string) {
  return `\\hat{${variable}}`
}

export function frac(a: string, b: string) {
  return `\\frac{${a}}{${b}}`
}

import { serve, ServerRequest, parse, exists } from "./deps.ts";
import { PageModule } from "./page.ts";

const wwwExistsRoot = parse(decodeURI(import.meta.url.replace("file:///",""))).dir+"/www";
const wwwRoot = parse(import.meta.url).dir+"/www";
const redirectToHomeHeaders = new Headers({
  "Location": "/p"
});
const defaultPageHeaders = new Headers({
  "Content-Type": "text/html"
});

// Start web service
const s = serve({ port: 2305 });
console.log("SPX StudyCities");
console.log("Web service on port 2305");

// Auto open user's browser
const p = Deno.run({ cmd: ["cmd", "/C", "start", "", "http://localhost:2305/p"] });
await p.status();
Deno.close(p.rid);

// Handle requests
for await (const r of s) {
  if (r.url === "/") r.respond({ status: 308, headers: redirectToHomeHeaders });
  // Serve Pages
  else if (r.url.startsWith("/p/")) {
    servePage(r);
  }
  // Serve Images
  else if (r.url.startsWith("/i/")) {
    r.respond({status:200});
  }
  else r.respond({status:404});
}

async function servePage(r: ServerRequest): Promise<void> {
  if (await exists(wwwExistsRoot+r.url+".ts")) {
    const p = await import(wwwRoot+r.url+".ts") as PageModule;
    r.respond({
      status: 200,
      headers: defaultPageHeaders,
      body: "<!DOCTYPE html><html><head>"+p.head(r)+"</head><body>"+p.body(r)+"</body></html>"
    });
  }
  else r.respond({status:404});
}

function pg_404(r: ServerRequest): void {

}

function pg_500(r: ServerRequest): void {

}

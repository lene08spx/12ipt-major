import { serve, ServerRequest, parse, exists } from "./deps.ts";
//import { PageModule } from "./page.ts";

const webPort = 2020;

const wwwExistsRoot = parse(decodeURI(import.meta.url.replace("file:///",""))).dir+"/www";
const wwwRoot = parse(import.meta.url).dir+"/www";
const redirectToHomeHeaders = new Headers({
  "Location": "/index.html"
});
const defaultPageHeaders = new Headers({
  "Content-Type": "text/html"
});

const mimeTypes = new Map([
  [".html", "text/html"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".css", "text/css"],
  [".txt", "text/plain"],
  [".js", "text/javascript"],
  [".svg", "image/svg+xml"],
]);

// Start web service
const s = serve({ port: webPort });
console.log("+----------------------------------------------+");
console.log("| SPX StudyCities                              |");
console.log("|                                              |");
console.log("| 2020 IPT - Major Project                     |");
console.log("| Oliver Lenehan                               |");
console.log("|                                              |");
console.log("| Visit http://localhost:${webPort}/index.html |");
console.log("+----------------------------------------------+");

// Auto open user's browser
const p = Deno.run({ cmd: ["cmd", "/C", "start", "", `http://localhost:${webPort}/index.html`] });
await p.status();
Deno.close(p.rid);

// Handle requests
for await (const r of s) {
  if (r.url === "/")
    r.respond({ status: 308, headers: redirectToHomeHeaders });
  else
    servePage(r);
}

async function servePage(r: ServerRequest): Promise<void> {
  // if url has no extension, search for url+'.ts' (dynamic page)
  // else look for url+'/index.ts'
  // else serve up
  //r.url = r.url.replace(/[\/]+$/m, "");
  const parsedUrl = parse(r.url);
  //if (!parsedUrl.ext) {
  //  if (!(await dynamicPageExists(r.url)))
  //    return r.respond({status: 404});
    
    /*let page: PageModule;
    if (await dynamicPageExists(r.url))
      page = await dynamicPageImport(r.url);
    else if (await dynamicPageExists(r.url+"/index"))
      page = await dynamicPageImport(r.url+"/index");
    else
      return r.respond({status: 404});
    return r.respond({
      status: 200,
      headers: defaultPageHeaders,
      body: 
        "<!DOCTYPE html><html><head>" +
        page.head(r)+"</head><body>" +
        page.body(r)+"</body></html>"
    });*/
  if (await exists(wwwExistsRoot+r.url)) {
    /*let body = await Deno.readTextFile(wwwExistsRoot+r.url);
    if (parsedUrl.ext === ".html") {
      const includes = body.matchAll(/<include href=".*"\/>/g);
      for (const i of includes) {
        const fileToInclude = i[0].replace('<include href="','').replace('"/>','');
        if (await exists(wwwExistsRoot+"/"+fileToInclude))
          body = body.slice(0,i.index)+(await Deno.readTextFile(wwwExistsRoot+"/"+fileToInclude))+body.slice((i.index??0)+i[0].length);
      }
    }*/
    return r.respond({
      status: 200,
      headers: new Headers([
        ["Content-Type", mimeTypes.get(parsedUrl.ext)??"text/plain"]
      ]),
      body: await Deno.readFile(wwwExistsRoot+r.url)
    });
  }
  else
    return r.respond({status: 404});
}

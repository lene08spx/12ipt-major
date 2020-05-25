import * as page from "../../page.ts";

export const head: page.Renderer = (r)=>{
  return (
    page.title("SPX - Example")
  );
}

export const body: page.Renderer = (r)=>{
  return (
    page.h1("Hello, World")
  );
}

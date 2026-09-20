import type { APIRoute } from "astro";
import spec from "../../../data/processing.openapi.json";
export const prerender = true;
export const GET: APIRoute = () =>
  new Response(JSON.stringify(spec), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });

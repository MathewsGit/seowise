import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const backendUrl = process.env.OPEN_SEO_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  const path = params.path.join("/");
  const targetPath = path === "mcp" ? "/mcp" : `/api/${path}`;
  const targetUrl = new URL(`${backendUrl}${targetPath}${request.nextUrl.search}`);

  const headers = new Headers(request.headers);
  headers.set("Host", new URL(backendUrl).host);
  headers.delete("origin");
  headers.delete("referer");

  // Prevent Cloudflare from sending compressed binary data that bypasses Node's fetch parser
  headers.delete("accept-encoding"); 
  // Prevent body size mismatches since we re-stringify the body below
  headers.delete("content-length");

  // CRITICAL: The MCP backend strictly requires this Accept header
  headers.set("Accept", "application/json, text/event-stream");

  // Auth: Programmatic API key for MCP
  if (process.env.OPEN_SEO_API_KEY) {
    headers.set("x-api-key", process.env.OPEN_SEO_API_KEY);
  }

  // Auth: Cloudflare Access Service Tokens
  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers.set("CF-Access-Client-Id", process.env.CF_ACCESS_CLIENT_ID);
    headers.set("CF-Access-Client-Secret", process.env.CF_ACCESS_CLIENT_SECRET);
  }

  let body: any;
  if (request.method === "POST" && request.headers.get("content-type")?.includes("application/json")) {
    try {
      body = await request.json();
      if (path === "mcp" && process.env.OPEN_SEO_PROJECT_ID && body?.params?.arguments) {
        body.params.arguments.projectId = process.env.OPEN_SEO_PROJECT_ID;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("text/event-stream")) {
      return new NextResponse(response.body, { status: response.status, headers: response.headers });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": contentType || "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Failed to communicate with SEO engine" }, { status: 502 });
  }
}

export { 
  handleProxy as GET, 
  handleProxy as POST, 
  handleProxy as PUT, 
  handleProxy as DELETE,
  handleProxy as PATCH 
};
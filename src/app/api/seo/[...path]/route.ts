import { NextRequest, NextResponse } from "next/server";

export async function ALL(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.OPEN_SEO_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  // Next.js 16 requires awaiting params
  const { path: pathSegments } = await context.params;
  const path = pathSegments.join("/");
  
  const targetUrl = new URL(`${backendUrl}/api/${path}${req.nextUrl.search}`);

  // Inject projectId if set and missing
  const projectId = process.env.OPEN_SEO_PROJECT_ID;
  if (projectId && !targetUrl.searchParams.has("projectId")) {
    targetUrl.searchParams.set("projectId", projectId);
  }

  const headers = new Headers(req.headers);
  headers.delete("origin");
  headers.delete("referer");
  headers.set("Host", new URL(backendUrl).host);

  const apiKey = process.env.OPEN_SEO_API_KEY;
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.blob(),
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to backend engine" }, { status: 502 });
  }
}

export { ALL as GET, ALL as POST, ALL as PUT, ALL as DELETE, ALL as PATCH };
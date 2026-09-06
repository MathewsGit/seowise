import { NextRequest, NextResponse } from "next/server";

async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  // 1. Get user session / auth check here (e.g. Clerk, NextAuth, Kinde, Supabase)
  // const user = await getCurrentUser();
  // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Build backend URL
  const backendUrl = process.env.OPEN_SEO_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  const path = params.path.join("/");
  const targetUrl = `${backendUrl}/api/${path}${req.nextUrl.search}`;

  // 3. Prepare headers
  const headers = new Headers(req.headers);
  headers.set("Host", new URL(backendUrl).host);

  // Strip client origin headers to prevent CORS issues on worker side
  headers.delete("origin");
  headers.delete("referer");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.blob(),
      // Optional: cache options or revalidation settings
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("SEO Proxy Error:", error);
    return NextResponse.json({ error: "Failed to communicate with SEO engine" }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PUT, handleProxy as DELETE };
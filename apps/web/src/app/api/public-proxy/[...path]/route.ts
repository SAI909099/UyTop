import { NextResponse } from 'next/server';

async function forward(request: Request, path: string[]) {
  if (!path.length || path[0] !== 'catalog') {
    return NextResponse.json({ detail: 'Not found.' }, { status: 404 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
  const upstreamUrl = new URL(`${apiBaseUrl}/${path.join('/')}`);
  const incomingUrl = new URL(request.url);
  upstreamUrl.search = incomingUrl.search;

  const response = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}

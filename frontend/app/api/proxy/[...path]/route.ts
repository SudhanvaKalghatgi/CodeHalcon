import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const API_KEY = process.env.BACKEND_API_KEY || '';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const pathname = path.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/${pathname}${search}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }

  // Try JSON first, fall back to raw text — preserves original status codes
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Non-JSON response — forward as-is
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': contentType || 'text/plain' },
  });
}
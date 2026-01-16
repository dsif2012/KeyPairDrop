import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const envOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '';
const allowedOrigins = envOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function getAllowedOrigin(origin: string | null, fallback: string) {
  if (!origin) return null;
  if (allowedOrigins.length === 0 && origin === fallback) {
    return origin;
  }
  return allowedOrigins.includes(origin) ? origin : null;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const fallbackOrigin = request.nextUrl.origin;
  const allowedOrigin = getAllowedOrigin(origin, fallbackOrigin);

  const response = NextResponse.next();

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Vary', 'Origin');
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};


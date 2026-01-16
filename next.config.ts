import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// 開發模式使用寬鬆的 CSP（Next.js 需要 inline scripts/styles）
// 生產模式使用嚴格的 CSP
const cspPolicy = isDev
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.firebasedatabase.app",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob: https://www.google-analytics.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app https://*.googleapis.com wss://*.firebaseio.com wss://*.firebasedatabase.app https://www.google-analytics.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; ')
  : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.firebasedatabase.app",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob: https://www.google-analytics.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app https://*.googleapis.com wss://*.firebaseio.com wss://*.firebasedatabase.app https://www.google-analytics.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; ');

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// script-src: Next.js はハイドレーション用のインラインスクリプトを使うため 'unsafe-inline' は必要。
// 'unsafe-eval' は開発時（React Fast Refresh）にのみ許可し、本番では除去してハードニングする。
const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isProd ? "" : "'unsafe-eval'",
]
  .filter(Boolean)
  .join(" ");

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // ブラウザからの直接通信は Supabase（認証・DB）のみ。AI 呼び出しはサーバー側なので
  // connect-src には不要だが、利用プロバイダを明示する意図で許可ドメインも併記する。
  "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.anthropic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

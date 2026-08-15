import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Content Security Policy directives based on external resources used in the app:
// - Google Tag Manager (GTM-MSXHDMVL)
// - Google reCAPTCHA v3
// - Google OAuth (next-auth)
// - Sign in with Apple JS (popup flow)
// - Backend API (sandbox-api.e-syrians.com)
// - Social sharing links (Facebook, Twitter, LinkedIn, WhatsApp)
const cspDirectives = [
  // Scripts: self + GTM + reCAPTCHA + Vercel toolbar (preview deployments) +
  // Apple Sign-In JS SDK (loaded from appleid.cdn-apple.com)
  // 'unsafe-inline' required for GTM and Next.js inline scripts
  // 'unsafe-eval' required for GTM custom JS variables
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://vercel.live https://appleid.cdn-apple.com`,

  // Styles: self + inline (Tailwind, HeroUI)
  `style-src 'self' 'unsafe-inline'`,

  // Images: self + OG images + analytics + avatars (DO Spaces primary,
  // legacy AWS S3 retained during the migration retention window) +
  // GitHub contributor avatars.
  // - DO Spaces origin hostname (`<bucket>.<region>.digitaloceanspaces.com`)
  //   is what pre-signed URLs from `Storage::disk('s3')->temporaryUrl(...)`
  //   resolve to.
  // - The `.cdn.` variant is only needed if avatars are loaded via the
  //   Spaces CDN (public unsigned URLs from `Storage::url()`); pre-signed
  //   URLs bypass CDN so both entries cover the two access paths.
  // google.com.tr covers Google Ads audience pixels served from country-code TLDs.
  `img-src 'self' data: blob: https://www.e-syrians.com https://e-syrians-network.fra1.digitaloceanspaces.com https://e-syrians-network.fra1.cdn.digitaloceanspaces.com https://e-syrians.s3.eu-north-1.amazonaws.com https://avatars.githubusercontent.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google.com https://*.google.com.tr https://*.gstatic.com https://pagead2.googlesyndication.com`,

  // Fonts: local only (IBM Plex Sans Arabic loaded from /public)
  `font-src 'self' data:`,

  // API connections: self + backend API + analytics + reCAPTCHA + Apple ID
  // analytics.google.com is the GA4 Measurement Protocol endpoint (/g/collect)
  // stats.g.doubleclick.net is used by GTM for Google Ads conversion tracking
  // appleid.apple.com handles auth XHRs from the Sign-In JS SDK after popup return
  `connect-src 'self' https://sandbox-api.e-syrians.com https://api.e-syrians.com https://www.google.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://appleid.apple.com`,

  // Frames: reCAPTCHA iframe + Google OAuth popup + Apple Sign-In popup + status badge
  `frame-src 'self' https://www.google.com https://accounts.google.com https://www.googletagmanager.com https://status.e-syrians.com https://appleid.apple.com`,

  // Web workers
  `worker-src 'self' blob:`,

  // Child/frame ancestors
  `frame-ancestors 'self'`,

  // Form submissions: self + Apple ID (the Sign-In popup posts the auth form to apple.com)
  `form-action 'self' https://appleid.apple.com`,

  // Base URI
  `base-uri 'self'`,

  // Object/embed (block plugins)
  `object-src 'none'`,
];

const csp = cspDirectives.join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // DigitalOcean Spaces — primary avatar store. Two entries
      // because pre-signed URLs (`temporaryUrl`) resolve to the
      // origin hostname, and public URLs (`Storage::url`) resolve
      // through the CDN hostname when the Space has CDN enabled.
      {
        protocol: "https",
        hostname: "e-syrians-network.fra1.digitaloceanspaces.com",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "e-syrians-network.fra1.cdn.digitaloceanspaces.com",
        pathname: "/avatars/**",
      },
      // Legacy AWS S3 — retained during the migration retention
      // window so any avatar records still pointing at S3 continue
      // to render. Safe to delete alongside the `aws` disk block
      // in the API's config/filesystems.php after cutover verifies.
      {
        protocol: "https",
        hostname: "e-syrians.s3.eu-north-1.amazonaws.com",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

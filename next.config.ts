import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

// Content Security Policy directives based on external resources used in the app:
// - Google Tag Manager (GTM-MSXHDMVL)
// - Google reCAPTCHA v3
// - Google OAuth (next-auth)
// - Mapbox GL JS + RTL text plugin
// - Backend API (sandbox-api.e-syrians.com)
// - Social sharing links (Facebook, Twitter, LinkedIn, WhatsApp)
const cspDirectives = [
  // Scripts: self + GTM + reCAPTCHA + Mapbox RTL plugin
  // 'unsafe-inline' required for GTM and Next.js inline scripts
  // 'unsafe-eval' required for GTM custom JS variables
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://api.mapbox.com`,

  // Styles: self + inline (Tailwind, HeroUI, Mapbox)
  `style-src 'self' 'unsafe-inline' https://api.mapbox.com`,

  // Images: self + OG images + analytics + Mapbox tiles
  `img-src 'self' data: blob: https://www.e-syrians.com https://www.googletagmanager.com https://www.google-analytics.com https://*.mapbox.com https://*.google.com https://*.gstatic.com`,

  // Fonts: local only (IBM Plex Sans Arabic loaded from /public)
  `font-src 'self' data:`,

  // API connections: self + backend API + analytics + reCAPTCHA + Mapbox
  `connect-src 'self' https://sandbox-api.e-syrians.com https://api.e-syrians.com https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://*.mapbox.com https://events.mapbox.com`,

  // Frames: reCAPTCHA iframe + Google OAuth popup
  `frame-src 'self' https://www.google.com https://accounts.google.com https://www.googletagmanager.com`,

  // Web workers: Mapbox uses blob workers
  `worker-src 'self' blob:`,

  // Child/frame ancestors
  `frame-ancestors 'self'`,

  // Form submissions
  `form-action 'self'`,

  // Base URI
  `base-uri 'self'`,

  // Object/embed (block plugins)
  `object-src 'none'`,
];

const csp = cspDirectives.join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://omilearn.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/privacy',
          '/terms',
          '/features',
          '/tools',
          '/blog',
          '/use-cases',
          '/manifest.webmanifest',
          '/favicon.ico',
          '/og-image.png',
        ],
        disallow: [
          '/admin',
          '/dashboard',
          '/learn',
          '/project',
          '/roadmap',
          '/teacher',
          '/workspace',
          '/reference-viewer',
          '/calendar-callback',
          '/api',
          '/_next/server',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

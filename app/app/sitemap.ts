import type { MetadataRoute } from 'next';

const baseUrl = 'https://omilearn.com';

const staticRoutes = [
  '',
  '/landing',
  '/features',
  '/tools',
  '/tools/ai-quiz-generator',
  '/tools/flashcard-generator',
  '/tools/study-plan-generator',
  '/blog',
  '/blog/ai-hoc-tap',
  '/blog/ai-study-assistant',
  '/blog/ai-quiz-generator',
  '/blog/tao-lo-trinh-hoc-bang-ai',
  '/use-cases/students',
  '/use-cases/teachers',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/landing' ? 'weekly' : 'monthly',
    priority: route === '' || route === '/landing' ? 1 : route.startsWith('/tools') ? 0.9 : 0.8,
  }));
}

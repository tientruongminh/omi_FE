import type { MetadataRoute } from 'next';

const baseUrl = 'https://omilearn.com';

const staticRoutes: { route: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { route: '', priority: 1, changeFrequency: 'weekly' },
  { route: '/landing', priority: 1, changeFrequency: 'weekly' },
  { route: '/features', priority: 0.85, changeFrequency: 'monthly' },
  { route: '/tools', priority: 0.9, changeFrequency: 'weekly' },
  { route: '/tools/ai-quiz-generator', priority: 0.9, changeFrequency: 'monthly' },
  { route: '/tools/flashcard-generator', priority: 0.9, changeFrequency: 'monthly' },
  { route: '/tools/study-plan-generator', priority: 0.9, changeFrequency: 'monthly' },
  { route: '/blog', priority: 0.85, changeFrequency: 'weekly' },
  { route: '/blog/ai-hoc-tap', priority: 0.8, changeFrequency: 'monthly' },
  { route: '/blog/ai-study-assistant', priority: 0.8, changeFrequency: 'monthly' },
  { route: '/blog/ai-quiz-generator', priority: 0.8, changeFrequency: 'monthly' },
  { route: '/blog/tao-lo-trinh-hoc-bang-ai', priority: 0.8, changeFrequency: 'monthly' },
  { route: '/use-cases/students', priority: 0.75, changeFrequency: 'monthly' },
  { route: '/use-cases/teachers', priority: 0.75, changeFrequency: 'monthly' },
  { route: '/privacy', priority: 0.35, changeFrequency: 'monthly' },
  { route: '/terms', priority: 0.35, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}

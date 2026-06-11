import { MetadataRoute } from 'next';

const BASE = 'https://letsexploring.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/features/itinerary', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/budget', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/packing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/map', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features/ai-suggestions', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/features/crew', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/features/offline', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/destinations/israel', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/destinations/negev', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        'en-US': `${BASE}${path}`,
        'he-IL': `${BASE}${path}?lang=he`,
      },
    },
  }));
}

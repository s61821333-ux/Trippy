import { MetadataRoute } from 'next';

const BASE = 'https://letsexploring.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only include pages that actually exist — phantom URLs in sitemaps cause 404 crawl waste.
  const pages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
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

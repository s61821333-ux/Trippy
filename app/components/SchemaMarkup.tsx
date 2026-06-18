const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Trippy',
      alternateName: ['Trippy Group Trip Planner', 'Trippy Travel App'],
      description:
        'Free group trip planner with shared itinerary, interactive map, group budget tracker, and packing list. Plan your trip together in one place.',
      url: 'https://letsexploring.com',
      applicationCategory: 'TravelApplication',
      applicationSubCategory: 'Trip Planning',
      operatingSystem: 'Web, iOS (PWA), Android (PWA)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Collaborative itinerary planning',
        'Group budget tracking',
        'Expense splitting',
        'Interactive trip map',
        'Shared packing list',
        'AI activity suggestions',
        'Offline support',
        'Emergency contacts hub',
        'Trip DNA sharing card',
        'Multi-currency support',
      ],
      inLanguage: ['en', 'he'],
      screenshot: 'https://letsexploring.com/og-image.png',
      softwareVersion: '2.0',
    },
    {
      '@type': 'Organization',
      name: 'Trippy',
      url: 'https://letsexploring.com',
      logo: 'https://letsexploring.com/icon-512.png',
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'guy9d2g5@gmail.com',
      },
    },
    {
      '@type': 'WebSite',
      name: 'Trippy',
      url: 'https://letsexploring.com',
    },
  ],
};

export function LandingSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

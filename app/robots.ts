import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamkeen-thought-leadership.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    // /edit and its API are publicly reachable by design (the password is the
    // control), but there is no reason to advertise them to crawlers.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/edit', '/api/'] }],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

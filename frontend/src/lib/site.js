// Public address of the live site: used for canonical links, the sitemap and structured data.
// Set NEXT_PUBLIC_SITE_URL in production if the domain differs from the default below.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://naarzi.com').replace(/\/+$/, '');

export const SITE_NAME = 'NAARZI';
export const SITE_DESCRIPTION =
  'NAARZI is a Delhi design house turning colour into clothing that speaks. Shop dresses, co-ords and statement pieces with delivery across India.';

// Server-side fetch of the backend API for pages, metadata and the sitemap.
// Returns null on any failure so a down API never breaks a build or a crawl.
export async function fetchApi(path, revalidate = 3600) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success === false ? null : json;
  } catch {
    return null;
  }
}

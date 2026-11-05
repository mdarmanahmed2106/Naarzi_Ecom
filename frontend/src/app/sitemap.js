import { SITE_URL, fetchApi } from '@/lib/site';

// Rebuilt at most hourly so new products show up without a redeploy
export const revalidate = 3600;

const STATIC_PAGES = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/shipping-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/exchange-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

async function allProducts() {
  const products = [];
  // The API caps a page at 100 products, so walk the pages
  for (let page = 1; page <= 50; page++) {
    const json = await fetchApi(`/products?limit=100&page=${page}`);
    if (!json?.data) break;
    products.push(...json.data);
    if (page >= (json.pagination?.totalPages || 1)) break;
  }
  return products;
}

export default async function sitemap() {
  const [products, categoriesJson] = await Promise.all([allProducts(), fetchApi('/categories')]);

  const pages = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const categories = (categoriesJson?.data || [])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(c.slug)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const productPages = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [...pages, ...categories, ...productPages];
}

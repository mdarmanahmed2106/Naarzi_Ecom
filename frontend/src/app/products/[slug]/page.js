import { cache } from 'react';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { cldImage, IMG } from '@/lib/cloudinary';
import { SITE_URL, SITE_NAME, fetchApi } from '@/lib/site';

// One fetch per request, shared by the metadata and the page
const getProduct = cache(async (slug) => {
  const json = await fetchApi(`/products/${encodeURIComponent(slug)}`, 600);
  return json?.data || null;
});

// True only when the API answered 404, so an API outage is never reported as a missing product
const isMissing = cache(async (slug) => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return false;
  try {
    const res = await fetch(`${base}/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    return res.status === 404;
  } catch {
    return false;
  }
});

const clip = (text, max) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found', robots: { index: false } };

  const image = product.colors?.[0]?.images?.[0];
  const description = clip(product.description, 155)
    || `${product.name} by ${SITE_NAME}. Delivery across India.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: cldImage(image, IMG.large), alt: product.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: product.name, description },
  };
}

function productJsonLd(product) {
  const url = `${SITE_URL}/products/${product.slug}`;
  const price = product.discountedPrice ?? product.price;
  const images = (product.colors || []).flatMap((c) => c.images || []).slice(0, 6).map((i) => cldImage(i, IMG.large));
  const inStock = (product.stock ?? 0) > 0;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: clip(product.description, 500),
    sku: product.slug,
    url,
    image: images,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.category?.name && { category: product.category.name }),
    ...((product.colors || []).length > 0 && { color: product.colors.map((c) => c.name).join(', ') }),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: String(price),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  const reviews = product.reviews || [];
  if (reviews.length > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
    };
  }
  return ld;
}

function breadcrumbJsonLd(product) {
  const items = [{ name: 'Home', url: SITE_URL }];
  if (product.category?.slug) items.push({ name: product.category.name, url: `${SITE_URL}/shop?category=${product.category.slug}` });
  items.push({ name: product.name, url: `${SITE_URL}/products/${product.slug}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

// "<" is escaped so a product description can never close the script tag
const json = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  // A real 404 for products that don't exist, so search engines drop them
  if (!product && (await isMissing(slug))) notFound();

  return (
    <>
      {product && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(productJsonLd(product)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(breadcrumbJsonLd(product)) }} />
        </>
      )}
      <ProductDetail slug={slug} />
    </>
  );
}

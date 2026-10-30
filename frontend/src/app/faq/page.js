import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FaqContent from '@/components/faq/FaqContent';
import { getFaqGroups } from '@/lib/faqContent';

export const metadata = {
  title: 'FAQs | NAARZI',
  description: 'Answers to common questions about NAARZI: who we are, what we sell, sizing, fabric, styling and more.',
};

// Free-shipping amount and fee come from the admin's store settings; refreshed at most hourly
async function getShippingSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return {};
  try {
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const json = await res.json();
    return {
      freeShippingThreshold: Number(json?.data?.freeShippingThreshold) || 0,
      shippingCost: Number(json?.data?.shippingCost) || 0,
    };
  } catch {
    return {};
  }
}

export default async function FaqPage() {
  const groups = getFaqGroups(await getShippingSettings());

  // FAQPage structured data so search engines and AI assistants can quote answers directly
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Header />
      <FaqContent groups={groups} />
      <Footer />
    </div>
  );
}

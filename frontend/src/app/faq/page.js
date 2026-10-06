import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import FaqContent from '@/components/faq/FaqContent';
import { getFaqGroups } from '@/lib/faqContent';

export const metadata = {
  title: 'FAQs | NAARZI',
  description: 'Answers to common questions about NAARZI — who we are, what we sell, sizing, fabric, styling and more.',
};

// Free-shipping amount comes from the admin's store settings; refreshed at most hourly
async function getFreeShippingThreshold() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return 0;
  try {
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return 0;
    const json = await res.json();
    return Number(json?.data?.freeShippingThreshold) || 0;
  } catch {
    return 0;
  }
}

export default async function FaqPage() {
  const groups = getFaqGroups({ freeShippingThreshold: await getFreeShippingThreshold() });

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
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

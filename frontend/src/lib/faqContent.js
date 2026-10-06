import { formatCurrency } from '@/lib/formatCurrency';

export const SUPPORT_EMAIL = 'support@naarzi.com';
export const SUPPORT_HOURS = 'Mon – Sat, 10am – 7pm IST';

/**
 * Site-wide FAQ, grouped. Copy from the NAARZI brand content doc (section 7), written
 * answer-first so search and AI answer boxes can quote it directly. Shipping/returns use the
 * policies already published on the site; the free-shipping amount comes from store settings.
 */
export function getFaqGroups({ freeShippingThreshold = 0 } = {}) {
  const shippingAnswer =
    freeShippingThreshold > 0
      ? `Shipping is free on orders over ${formatCurrency(freeShippingThreshold)}; below that, a delivery charge is shown at checkout before you pay. We deliver across India, and every order shows an estimated delivery date at checkout. Timelines are estimates rather than guarantees, as courier delays can occasionally happen.`
      : 'We deliver across India, and every order shows its delivery charge and an estimated delivery date at checkout, before you pay. Timelines are estimates rather than guarantees, as courier delays can occasionally happen.';

  return [
    {
      id: 'about',
      title: 'About NAARZI',
      items: [
        {
          q: 'What is NAARZI?',
          a: 'NAARZI is a contemporary, colour-led women’s fashion label built around the idea that clothing is a form of expression, not just fabric. Every collection starts with a palette rather than a trend, and is produced in limited runs rather than mass quantities.',
        },
        {
          q: 'What kind of clothing does NAARZI sell?',
          a: 'NAARZI’s edit spans shirts, kurtis and tunics, co-ord sets, suit sets and skirts — designed in soft, breathable fabrics with a consistent colour-first point of view.',
        },
        {
          q: 'Who is NAARZI for?',
          a: 'The urban, style-conscious woman, roughly 22–38, who wants pieces that feel considered rather than mass-produced, and is as interested in how something wears as in how it looks.',
        },
        {
          q: 'What makes NAARZI different?',
          a: 'Five things: colour comes first in every design decision; every detail is intentional rather than decorative; pieces move from desk to evening without needing to change; collections are limited rather than endlessly restocked; and every piece is designed to say something true about the person wearing it.',
        },
        {
          q: 'Who designs NAARZI?',
          a: 'NAARZI is built around a founder’s personal point of view — noticing beauty where others saw waste, and carrying that instinct for colour and detail into every collection.',
          link: { href: '/about', label: 'Read our story' },
        },
      ],
    },
    {
      id: 'fit',
      title: 'Sizing, Fabric & Styling',
      items: [
        {
          q: 'What sizes does NAARZI offer?',
          a: 'Sizing currently ranges from SX to XXL depending on the style. Each product page lists the exact sizes available for that piece, and shows which ones are in stock.',
        },
        {
          q: 'What fabrics does NAARZI use?',
          a: 'Across the edit: a soft fabric called Neelam (used in shirts, kurtis and tunics), breathable cotton (co-ord sets), chiffon (skirts) and pure silk (suit sets). Fabric details are listed on each product page.',
        },
        {
          q: 'What occasions are NAARZI pieces suitable for?',
          a: 'It depends on the piece. Shirts and select kurtis are built for everyday and office wear; suit sets move between office wear and festive events; co-ord sets suit daytime and party settings. Occasion detail is listed on each product page.',
        },
        {
          q: 'How should I style a NAARZI co-ord set?',
          a: 'Wear the two pieces together for a complete look, or separate them — the top with denim, the bottoms with a plain tee — for everyday versatility.',
        },
      ],
    },
    {
      id: 'orders',
      title: 'Orders, Shipping & Returns',
      items: [
        { q: 'How much does shipping cost, and how long does delivery take?', a: shippingAnswer },
        {
          q: 'How do I pay?',
          a: 'Payments are processed securely through Razorpay at checkout — UPI, cards, net banking and wallets are all supported.',
        },
        {
          q: 'Can I cancel my order?',
          a: 'Yes, while it is still processing. You can cancel it yourself from the orders section of your account. Once an order has shipped it can no longer be cancelled online — write to us and we’ll help.',
          link: { href: '/account', label: 'Go to my orders' },
        },
        {
          q: 'What is your returns policy?',
          a: 'Items can be returned within 7 days of delivery, provided they are unused and in their original packaging. Return shipping costs are the customer’s responsibility. To start a return, write to us with your order ID.',
        },
        {
          q: 'How do I contact NAARZI?',
          a: `Write to us at ${SUPPORT_EMAIL} (${SUPPORT_HOURS}). Include your order ID if your question is about an order.`,
          link: { href: '/contact', label: 'Contact us' },
        },
      ],
    },
  ];
}

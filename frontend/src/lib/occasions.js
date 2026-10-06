// Shop-by-occasion edits (copy from the NAARZI brand content doc, section 3).
// `slug` is the word to enter in a product's "Occasions" field in the admin.
export const OCCASIONS = [
  {
    slug: 'workwear',
    name: 'Workwear',
    tagline: 'Sharp enough for the room, soft enough for the day.',
    icon: 'work',
  },
  {
    slug: 'festive',
    name: 'Festive & Daytime Gatherings',
    tagline: 'Colour that knows how to show up.',
    icon: 'celebration',
  },
  {
    slug: 'everyday',
    name: 'Everyday',
    tagline: 'The pieces that make an ordinary Tuesday feel considered.',
    icon: 'wb_sunny',
  },
];

export const getOccasion = (slug) =>
  OCCASIONS.find((o) => o.slug === String(slug || '').toLowerCase()) || null;

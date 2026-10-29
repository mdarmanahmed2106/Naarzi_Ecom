// Choices for the product form that the storefront links to. Keep the occasion slugs in step with
// frontend/src/lib/occasions.js and the tags with the storefront menu links (/shop?tag=...).
export const OCCASION_OPTIONS = [
  { value: 'workwear', label: 'Workwear' },
  { value: 'festive', label: 'Festive & Daytime Gatherings' },
  { value: 'everyday', label: 'Everyday' },
];

export const PRESET_TAGS = [
  { value: 'new arrival', label: 'New Arrival' },
  { value: 'trending', label: 'Trending' },
];

// The shop matches tags ignoring case, and treats hyphens and spaces as the same
export const tagKey = (tag) => String(tag).trim().toLowerCase().replace(/[-\s]+/g, ' ');

export const splitList = (text) => text.split(',').map((s) => s.trim()).filter(Boolean);

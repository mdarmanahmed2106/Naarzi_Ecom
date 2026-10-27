// What a product still needs before the shop shows it (mirrors Product.LISTED_FILTER on the server)
export const missingForShop = (p) => {
  const missing = [];
  if (!p.description) missing.push('description');
  if (!p.category) missing.push('category');
  if (!p.colors || p.colors.length === 0) missing.push('colours');
  else {
    if (p.colors.some((c) => !c.images || c.images.length === 0)) missing.push('photos');
    if (p.colors.some((c) => !c.sizes || c.sizes.length === 0)) missing.push('sizes');
  }
  return missing;
};

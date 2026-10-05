/**
 * Size to pre-select for a product/colour: the first size that's in stock
 * (so a product with a single size always has it selected).
 * Sizes without a stock figure count as available. Returns '' if nothing can be bought.
 */
export const getDefaultSize = (sizes = []) => {
  const available = sizes.find((s) => s && (s.stock === undefined || s.stock === null || s.stock > 0));
  return available ? available.size : '';
};

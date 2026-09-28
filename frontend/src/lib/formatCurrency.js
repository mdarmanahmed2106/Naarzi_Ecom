export function formatCurrency(amount, options = {}) {
  const { decimals = 0 } = options;
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

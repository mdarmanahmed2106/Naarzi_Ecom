// Origins of our own storefront and admin. CLIENT_URL / ADMIN_CLIENT_URL may each list several
// origins, comma-separated (e.g. https://naarzi.com,https://www.naarzi.com,https://naarzi-shop.vercel.app)
const parseList = (list) => list.split(',').map((o) => o.trim().replace(/[/]+$/, '')).filter(Boolean);

const clientOrigins = () => parseList(process.env.CLIENT_URL || 'http://localhost:3000');
const adminOrigins = () => parseList(process.env.ADMIN_CLIENT_URL || 'http://localhost:3007');

// Private LAN IP ranges (RFC 1918), used to allow same-network devices (phones, other
// machines) to reach this dev server without hardcoding a specific IP that goes stale.
const isPrivateLanOrigin = (origin) => /^http:\/\/(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+):\d+$/.test(origin);

const isAllowedOrigin = (origin) => {
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  if (process.env.NODE_ENV === 'development' && isPrivateLanOrigin(origin)) return true;
  return clientOrigins().includes(origin) || adminOrigins().includes(origin);
};

const isAdminOrigin = (origin) => Boolean(origin) && adminOrigins().includes(origin);

module.exports = { isAllowedOrigin, isAdminOrigin };

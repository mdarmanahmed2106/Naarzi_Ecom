import os from 'os';

// Detect this machine's current LAN IP(s) at dev-server startup instead of hardcoding one —
// DHCP reassigns IPs across networks/reboots, so a fixed value goes stale.
const lanOrigins = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['shopforaurelia.com'],
  },
  allowedDevOrigins: lanOrigins,
  // The brand content doc lists the FAQ at /faqs; the site links to /faq
  async redirects() {
    return [{ source: '/faqs', destination: '/faq', permanent: true }];
  },
};

export default nextConfig;

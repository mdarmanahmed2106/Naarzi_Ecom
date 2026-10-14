'use client';

import AdminProvider from '@/components/admin/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';

// Every admin section shares one provider (data, forms, modals) and the same chrome
export default function DashboardLayout({ children }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

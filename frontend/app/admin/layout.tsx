'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { LayoutDashboard, Clock } from 'lucide-react';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Past Uploads', href: '/admin/past-uploads', icon: Clock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar navItems={adminNavItems} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

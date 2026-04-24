'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Clock, GraduationCap, LogOut, type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Past Evaluations', href: '/past-evaluations', icon: Clock },
];

interface SidebarProps {
  navItems?: NavItem[];
}

export default function Sidebar({ navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <aside className="w-56 min-h-screen bg-[#1a1a1a] flex flex-col pt-0 shrink-0 border-r border-white/5">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-[#1a1a1a]" />
        </div>
        <span className="text-white font-semibold text-base tracking-tight">AnswerIQ</span>
      </div>

      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-[#1a1a1a]'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}

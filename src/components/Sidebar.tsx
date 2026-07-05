'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  FileText,
  ClipboardList,
  Bell,
  LogOut
} from 'lucide-react';
import { clearTokens, authApi } from '@/lib/api-client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plans', href: '/dashboard/plans', icon: ClipboardList },
  { name: 'Disputes', href: '/dashboard/disputes', icon: FileText },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 border-r border-card-border bg-card-bg flex flex-col h-full select-none no-print">
      {/* Sidebar Header / Logo */}
      <div className="p-6 border-b border-card-border flex items-center gap-3">
        <span 
          className="text-3xl font-extrabold select-none transition-transform hover:rotate-12 duration-200" 
          style={{ color: "#2DCA73" }}
        >
          ∞
        </span>
        <span className="font-cursive text-3xl font-bold tracking-wide">
          Lemni
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group duration-300 relative border ${
                isActive 
                  ? 'bg-white text-foreground border-card-border shadow-[0_4px_12px_rgba(0,0,0,0.03)] after:absolute after:left-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-[#2DCA73] after:rounded-r' 
                  : 'text-muted border-transparent hover:text-foreground hover:bg-slate-50/50 hover:border-[#2DCA73]/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:-translate-y-[1px]'
              }`}
            >
              <Icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                isActive ? 'text-[#2DCA73]' : 'text-muted group-hover:text-foreground'
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / User section */}
      <div className="p-4 border-t border-card-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-500 rounded-lg hover:bg-rose-500/10 border border-transparent transition-colors group cursor-pointer"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

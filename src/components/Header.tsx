'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CheckCircle2, AlertTriangle, Info, User, Menu } from 'lucide-react';
import { notificationLogApi, NotificationLogRow } from '@/lib/api-client';

function timeAgo(dateString: string | null): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getMerchantName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('lemni_merchant');
    if (!raw) return null;
    const merchant = JSON.parse(raw) as { name?: string };
    return merchant.name ?? null;
  } catch {
    return null;
  }
}

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<NotificationLogRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const merchantName = getMerchantName();

  const loadNotifications = async () => {
    try {
      const result = await notificationLogApi.list({ limit: '5' });
      setAlerts(result.data);
      setUnreadCount(result.unreadCount);
    } catch {
      // Header notifications are supplementary — fail silently, full list is on /dashboard/notifications
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
    try {
      await notificationLogApi.markRead({ all: true });
    } catch {
      // best-effort; next load will reconcile actual state
    }
  };

  // Convert pathname to title
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard Overview';
    const sub = segments[1];
    return sub.charAt(0).toUpperCase() + sub.slice(1);
  };

  return (
    <header className="h-16 border-b border-card-border bg-card-bg px-6 flex items-center justify-between sticky top-0 z-40 select-none no-print">
      {/* Title / Path indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg border border-card-border hover:bg-muted-bg text-muted hover:text-foreground transition-all duration-200 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-foreground tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">

        {/* Notifications Dropdown Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`p-2 rounded-lg border border-card-border hover:bg-muted-bg text-muted hover:text-foreground transition-all duration-200 relative ${
              dropdownOpen ? 'bg-muted-bg text-foreground' : ''
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Dropdown Container */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card-bg border border-card-border rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-4 border-b border-card-border flex justify-between items-center bg-muted-bg">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-card-border">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted">
                    All caught up!
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 flex gap-3 text-xs transition-colors hover:bg-muted-bg ${
                        !alert.read ? 'bg-accent/5' : ''
                      }`}
                    >
                      {/* Icon type */}
                      <div className="mt-0.5">
                        {alert.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                        {alert.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {alert.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-foreground leading-normal">
                          {alert.message}
                        </p>
                        <span className="text-[10px] text-muted mt-1.5 block">
                          {timeAgo(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View all button */}
              <Link
                href="/dashboard/notifications"
                onClick={() => setDropdownOpen(false)}
                className="block text-center py-2.5 bg-muted-bg text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground border-t border-card-border transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User profile identifier */}
        <div className="h-8 w-px bg-card-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-card-border bg-muted-bg flex items-center justify-center text-muted">
            <User className="w-4 h-4" />
          </div>
          {merchantName && (
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              {merchantName}
            </span>
          )}
        </div>

      </div>
    </header>
  );
}

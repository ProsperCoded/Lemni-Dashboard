'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CheckCircle2, AlertTriangle, Info, User } from 'lucide-react';

interface AlertNotification {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  time: string;
  read: boolean;
}

const mockAlerts: AlertNotification[] = [
  { id: '1', type: 'warning', message: 'Payment failed for user_7294 (Standard Plan). Retry scheduled in 4 hours.', time: '10m ago', read: false },
  { id: '2', type: 'success', message: 'Nomba API connection bridge restored.', time: '1h ago', read: false },
  { id: '3', type: 'info', message: 'Plan "Max Membership" updated: price adjusted.', time: '3h ago', read: true },
  { id: '4', type: 'success', message: 'Subscription success for user_9931 (Basic Plan).', time: '5h ago', read: true },
];

export default function Header() {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<AlertNotification[]>(mockAlerts);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
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
      <div>
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
                        {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-foreground leading-normal">
                          {alert.message}
                        </p>
                        <span className="text-[10px] text-muted mt-1.5 block">
                          {alert.time}
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
        </div>

      </div>
    </header>
  );
}

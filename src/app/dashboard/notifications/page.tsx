'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Trash2,
  Check
} from 'lucide-react';
import { notificationLogApi, NotificationLogRow, ApiError } from '@/lib/api-client';

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'warning' | 'info'>('all');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationLogApi.list({ limit: '100' });
      setLogs(result.data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load notification logs';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
  }, []);

  // Filter logs (client-side, on already-loaded page)
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                          log.category.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return log.severity === activeTab && matchesSearch;
  });

  const handleMarkAllRead = async () => {
    setLogs(logs.map(log => ({ ...log, read: true })));
    try {
      await notificationLogApi.markRead({ all: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to mark notifications as read';
      setError(message);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to permanently clear all notification logs? This cannot be undone.')) return;

    const previousLogs = logs;
    setLogs([]);
    try {
      await notificationLogApi.clear();
    } catch (err) {
      setLogs(previousLogs);
      const message = err instanceof ApiError ? err.message : 'Failed to clear notification logs';
      setError(message);
    }
  };

  const handleToggleRead = async (id: string) => {
    const log = logs.find(l => l.id === id);
    if (!log) return;
    const nextRead = !log.read;
    setLogs(logs.map(l => l.id === id ? { ...l, read: nextRead } : l));
    try {
      await notificationLogApi.markRead({ ids: [id], read: nextRead });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update notification';
      setError(message);
    }
  };

  return (
    <div className="space-y-8 select-none">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Notification Audit Logs</h2>
          <p className="text-sm text-muted">Complete historical trail of subscription, payment, and system activities.</p>
        </div>

        {logs.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 border border-card-border hover:bg-muted-bg text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear history
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-rose-500">{error}</p>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card-bg border border-card-border p-4 rounded-xl shadow-sm">
        {/* Severity Tabs */}
        <div className="flex gap-1 border-b md:border-b-0 pb-3 md:pb-0 border-card-border overflow-x-auto">
          {(['all', 'success', 'warning', 'info'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-muted-bg'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search event logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>

      {/* Logs List Panel */}
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-2">
            <Bell className="w-8 h-8 text-muted/55" />
            No notification logs match your filters.
          </div>
        ) : (
          <div className="divide-y divide-card-border">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-5 flex gap-4 transition-colors hover:bg-muted-bg/30 ${
                  !log.read ? 'bg-accent/5' : ''
                }`}
              >
                {/* Icon type */}
                <div className="mt-0.5">
                  {log.severity === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {log.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {log.severity === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                </div>

                {/* Log details */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xs font-semibold text-foreground leading-normal">
                      {log.message}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-muted-bg px-2 py-0.5 rounded border border-card-border whitespace-nowrap">
                      {log.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-muted pt-1">
                    <span>{formatDate(log.createdAt)}</span>
                    <span>·</span>
                    <button
                      onClick={() => handleToggleRead(log.id)}
                      className="hover:text-foreground font-semibold hover:underline cursor-pointer"
                    >
                      Mark as {log.read ? 'unread' : 'read'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

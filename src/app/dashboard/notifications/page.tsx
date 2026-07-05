'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Search, 
  Trash2,
  Check 
} from 'lucide-react';

interface NotificationLog {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  timestamp: string;
  category: 'payment' | 'system' | 'subscription';
  read: boolean;
}

const initialLogs: NotificationLog[] = [
  { id: '1', type: 'warning', message: 'Payment attempt failed for user_7294 (Standard Plan) due to Insufficient Funds. Nomba retry scheduled on Jul 4, 2026, 08:00.', timestamp: 'Jul 03, 2026, 20:14', category: 'payment', read: false },
  { id: '2', type: 'success', message: 'Nomba API connection bridge restored. Uptime metrics normal.', timestamp: 'Jul 03, 2026, 19:15', category: 'system', read: false },
  { id: '3', type: 'info', message: 'Manual plan "Max Membership" price updated to ₦25,000 by admin.', timestamp: 'Jul 03, 2026, 17:05', category: 'subscription', read: true },
  { id: '4', type: 'success', message: 'Successful collection of ₦12,500.00 for user_9931 (Standard Plan). Subscription active.', timestamp: 'Jul 03, 2026, 15:30', category: 'payment', read: true },
  { id: '5', type: 'warning', message: 'Grace period expired for user_3950 (Basic Plan) after 5 failed payment retries. Access locked.', timestamp: 'Jul 03, 2026, 11:12', category: 'subscription', read: true },
  { id: '6', type: 'info', message: 'New customer card authorization tokenized for user_8820.', timestamp: 'Jul 02, 2026, 22:45', category: 'payment', read: true },
];

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'warning' | 'info'>('all');

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.category.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return log.type === activeTab && matchesSearch;
  });

  const handleMarkAllRead = () => {
    setLogs(logs.map(log => ({ ...log, read: true })));
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all notification logs?')) {
      setLogs([]);
    }
  };

  const handleToggleRead = (id: string) => {
    setLogs(logs.map(log => log.id === id ? { ...log, read: !log.read } : log));
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
        {filteredLogs.length === 0 ? (
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
                  {log.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {log.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {log.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
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
                    <span>{log.timestamp}</span>
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

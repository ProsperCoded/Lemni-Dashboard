'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Users,
  Percent,
  TrendingUp
} from 'lucide-react';
import { billingApi, ApiError } from '@/lib/api-client';

interface DashboardStats {
  mrr: number;
  activeSubscriptions: number;
  churnRate: number;
  recentVolume: number;
}

interface Transaction {
  id: string;
  customerId: string;
  subscriptionId: string | null;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

interface TransactionResponse {
  data: Transaction[];
  pagination: { total: number; limit: number; offset: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, txData] = await Promise.all([
          billingApi.getDashboardStats(),
          billingApi.getTransactions({ limit: '10', offset: '0' }),
        ]);
        setStats(statsData);
        setTransactions((txData as TransactionResponse).data || []);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to load dashboard data';
        setError(message);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statCards = [
    {
      name: 'Monthly Recurring Revenue',
      value: stats ? formatCurrency(stats.mrr) : '-',
      icon: CreditCard,
    },
    {
      name: 'Active Subscribers',
      value: stats?.activeSubscriptions ?? '-',
      icon: Users,
    },
    {
      name: 'Monthly Churn Rate',
      value: stats ? `${(stats.churnRate * 100).toFixed(2)}%` : '-',
      icon: Percent,
    },
    {
      name: '30-Day Volume',
      value: stats ? formatCurrency(stats.recentVolume) : '-',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 select-none">

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back to Lemni</h2>
          <p className="text-sm text-muted">Here is an overview of your billing engine performance.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-rose-500">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-card-bg border border-card-border rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#2DCA73]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-foreground transition-colors duration-300">
                      {stat.name}
                    </span>
                    <span className="p-2 bg-muted-bg border border-card-border rounded-lg text-muted group-hover:text-[#2DCA73] group-hover:border-[#2DCA73]/20 transition-all duration-300">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold tracking-tight truncate max-w-full">
                      {stat.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-card-bg border border-card-border rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#2DCA73]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden">
            <div className="p-6 border-b border-card-border flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Recent Transactions
                </h3>
                <p className="text-xs text-muted">Recent billing activities from Lemni Engine</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted-bg/60 border-b border-card-border text-[10px] font-bold uppercase tracking-wider text-muted">
                    <th className="py-3 px-6">Transaction ID</th>
                    <th className="py-3 px-6">Customer ID</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors duration-200">
                      <td className="py-3.5 px-6 font-bold text-foreground">{tx.id}</td>
                      <td className="py-3.5 px-6 text-muted font-medium">{tx.customerId.slice(0, 12)}...</td>
                      <td className="py-3.5 px-6 font-extrabold text-foreground">{formatCurrency(tx.amount)}</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          tx.status === 'success'
                            ? 'bg-success-bg border-success-border text-success'
                            : tx.status === 'pending'
                            ? 'bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            tx.status === 'success' ? 'bg-success' : tx.status === 'pending' ? 'bg-slate-700' : 'bg-rose-500'
                          }`} />
                          {tx.status === 'success' ? 'Success' : tx.status === 'pending' ? 'Pending' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-muted font-medium">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-6 text-center text-muted text-sm">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

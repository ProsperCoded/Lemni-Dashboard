'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Users, 
  Percent, 
  Activity, 
  TrendingUp 
} from 'lucide-react';

// Mock dashboard stats data
const stats = [
  {
    name: 'Monthly Recurring Revenue',
    value: '₦1,842,900.00',
    change: '+14.2%',
    positive: true,
    timeframe: 'vs last month',
    icon: CreditCard,
  },
  {
    name: 'Active Subscribers',
    value: '312',
    change: '+8.1%',
    positive: true,
    timeframe: 'vs last week',
    icon: Users,
  },
  {
    name: 'Monthly Churn Rate',
    value: '1.24%',
    change: '-0.32%',
    positive: true, // churn going down is positive
    timeframe: 'vs last month',
    icon: Percent,
  },
  {
    name: 'Nomba API Bridge',
    value: 'Operational',
    change: '99.98% uptime',
    positive: true,
    timeframe: 'Connection Stable',
    icon: Activity,
  },
];

// Mock recent transaction logs
const transactions = [
  { id: 'TXN-9028', user: 'johndoe@gmail.com', plan: 'Standard Plan', amount: '₦12,500.00', status: 'success', date: 'Jul 3, 2026, 20:14' },
  { id: 'TXN-9027', user: 'fitness_queen@yahoo.com', plan: 'Max Plan', amount: '₦25,000.00', status: 'success', date: 'Jul 3, 2026, 18:45' },
  { id: 'TXN-9026', user: 'sam_iron@outlook.com', plan: 'Basic Plan', amount: '₦5,000.00', status: 'failed', date: 'Jul 3, 2026, 17:30' },
  { id: 'TXN-9025', user: 'olivia_d@gmail.com', plan: 'Standard Plan', amount: '₦12,500.00', status: 'success', date: 'Jul 2, 2026, 22:10' },
  { id: 'TXN-9024', user: 'danny_boy@gmail.com', plan: 'Standard Plan', amount: '₦12,500.00', status: 'success', date: 'Jul 2, 2026, 14:02' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 select-none">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Banana Fitness</h2>
          <p className="text-sm text-muted">Here is an overview of your billing engine performance today.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                {stat.name !== 'Nomba API Bridge' && (
                  <span className={`inline-flex whitespace-nowrap items-center gap-0.5 text-xs font-bold ${
                    stat.positive ? 'text-success' : 'text-rose-500'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted font-medium">
                {stat.timeframe}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* MRR Progress Area Chart */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#2DCA73]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Revenue Growth (MRR)
              </h3>
              <p className="text-xs text-muted">Active monthly collections timeline</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-success bg-success-bg border border-success-border px-2 py-1 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% m/m
            </div>
          </div>

          {/* SVG Custom Revenue Chart */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <svg className="w-full h-56 group/chart" viewBox="0 0 600 240" preserveAspectRatio="none">
              <style>
                {`
                  @keyframes drawArea {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes drawLine {
                    from { stroke-dashoffset: 1500; }
                    to { stroke-dashoffset: 0; }
                  }
                  .animate-draw-line {
                    stroke-dasharray: 1500;
                    animation: drawLine 1.5s ease-out forwards;
                  }
                  .animate-draw-area {
                    animation: drawArea 1.5s ease-out forwards;
                  }
                `}
              </style>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DCA73" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2DCA73" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" className="text-card-border" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-card-border" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="600" y2="180" stroke="currentColor" className="text-card-border" strokeWidth="1" strokeDasharray="4 4" />

              {/* Area path (12 months) */}
              <path
                d="M 0 200 L 55 190 L 109 170 L 164 180 L 218 150 L 273 140 L 327 110 L 382 120 L 436 90 L 491 70 L 545 60 L 600 40 L 600 240 L 0 240 Z"
                fill="url(#areaGradient)"
                className="animate-draw-area"
              />

              {/* Line path (12 months) */}
              <path
                d="M 0 200 L 55 190 L 109 170 L 164 180 L 218 150 L 273 140 L 327 110 L 382 120 L 436 90 L 491 70 L 545 60 L 600 40"
                fill="none"
                stroke="#2DCA73"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-muted font-bold uppercase tracking-wider px-1">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Subscription Plan Distributions */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#2DCA73]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-1">
              Cohort Distribution
            </h3>
            <p className="text-xs text-muted">Plan subscriptions breakdown</p>
          </div>

          <div className="space-y-5 mt-6">
            {/* Basic Plan bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">Basic Plan (₦5k)</span>
                <span className="text-muted">187 subs (60%)</span>
              </div>
              <div className="h-2 w-full bg-muted-bg border border-card-border rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full animate-[pulse_4s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Standard Plan bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">Standard Plan (₦12.5k)</span>
                <span className="text-muted">94 subs (30%)</span>
              </div>
              <div className="h-2 w-full bg-muted-bg border border-card-border rounded-full overflow-hidden">
                <div className="h-full bg-[#2DCA73] rounded-full animate-[pulse_4s_ease-in-out_infinite_200ms]" style={{ width: '30%' }} />
              </div>
            </div>

            {/* Max Plan bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">Max Plan (₦25k)</span>
                <span className="text-muted">31 subs (10%)</span>
              </div>
              <div className="h-2 w-full bg-muted-bg border border-card-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full animate-[pulse_4s_ease-in-out_infinite_400ms]" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
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
                <th className="py-3 px-6">Customer Email</th>
                <th className="py-3 px-6">Subscription Plan</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors duration-200">
                  <td className="py-3.5 px-6 font-bold text-foreground">{tx.id}</td>
                  <td className="py-3.5 px-6 text-muted font-medium">{tx.user}</td>
                  <td className="py-3.5 px-6 text-foreground font-semibold">{tx.plan}</td>
                  <td className="py-3.5 px-6 font-extrabold text-foreground">{tx.amount}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      tx.status === 'success' 
                        ? 'bg-success-bg border-success-border text-success' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        tx.status === 'success' ? 'bg-success' : 'bg-rose-500'
                      }`} />
                      {tx.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-muted font-medium">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

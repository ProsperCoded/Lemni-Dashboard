'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  User, 
  MapPin, 
  Monitor, 
  Calendar, 
  ArrowRight, 
  FileCheck, 
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface AuditLog {
  timestamp: string;
  action: string;
  details: string;
  ip: string;
}

interface PaymentAttempt {
  id: string;
  date: string;
  amount: string;
  status: 'success' | 'failed';
  gatewayMessage: string;
  retryNumber: number;
}

interface CustomerAudit {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'past_due' | 'paused';
  signupDate: string;
  signupIp: string;
  device: string;
  payments: PaymentAttempt[];
  logs: AuditLog[];
}

const mockCustomerAudits: CustomerAudit[] = [
  {
    id: 'CUST-8820',
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    plan: 'Standard Plan (₦12,500/mo)',
    status: 'active',
    signupDate: 'May 01, 2026, 09:12',
    signupIp: '197.210.64.12 (Lagos, NG)',
    device: 'Chrome v124.0.0 / macOS Sonoma (Intel)',
    payments: [
      { id: 'TXN-9028', date: 'Jul 03, 2026, 20:14', amount: '₦12,500.00', status: 'success', gatewayMessage: 'Approved (Dunning Heuristic Retry #1)', retryNumber: 1 },
      { id: 'TXN-8742', date: 'Jul 01, 2026, 08:00', amount: '₦12,500.00', status: 'failed', gatewayMessage: 'Insufficient Funds', retryNumber: 0 },
      { id: 'TXN-6421', date: 'Jun 01, 2026, 08:00', amount: '₦12,500.00', status: 'success', gatewayMessage: 'Approved', retryNumber: 0 },
      { id: 'TXN-1290', date: 'May 01, 2026, 09:15', amount: '₦12,500.00', status: 'success', gatewayMessage: 'Approved', retryNumber: 0 },
    ],
    logs: [
      { timestamp: 'Jul 03, 2026, 20:14', action: 'Subscription Restored', details: 'Status shifted from past_due to active on successful retry.', ip: '197.210.64.12' },
      { timestamp: 'Jul 03, 2026, 20:14', action: 'Dunning Charge Executed', details: 'Automatic collection retry #1 triggered via Nomba tokenized API.', ip: 'Lemni Billing Cron' },
      { timestamp: 'Jul 01, 2026, 08:00', action: 'Subscription Past Due', details: 'Initial charge failed. Entered 5-day grace period.', ip: 'Lemni Billing Cron' },
      { timestamp: 'May 01, 2026, 09:15', action: 'Subscription Activated', details: 'Setup checkout session tokenized successfully.', ip: '197.210.64.12' },
    ]
  },
  {
    id: 'CUST-3950',
    name: 'Sam Iron',
    email: 'sam_iron@outlook.com',
    plan: 'Basic Plan (₦5,000/mo)',
    status: 'past_due',
    signupDate: 'Jun 15, 2026, 14:02',
    signupIp: '102.89.44.182 (Lagos, NG)',
    device: 'Edge v123.0.0 / Windows 11',
    payments: [
      { id: 'TXN-9026', date: 'Jul 03, 2026, 17:30', amount: '₦5,000.00', status: 'failed', gatewayMessage: 'Expired Card', retryNumber: 0 },
      { id: 'TXN-4190', date: 'Jun 15, 2026, 14:05', amount: '₦5,000.00', status: 'success', gatewayMessage: 'Approved', retryNumber: 0 },
    ],
    logs: [
      { timestamp: 'Jul 03, 2026, 17:30', action: 'Subscription Locked', details: 'Grace period bypassed due to card expiration. Access locked.', ip: 'Lemni Billing Cron' },
      { timestamp: 'Jul 03, 2026, 17:30', action: 'Charge Failed', details: 'Standard card payment rejected by Nomba gateway.', ip: 'Lemni Billing Cron' },
      { timestamp: 'Jun 15, 2026, 14:05', action: 'Subscription Activated', details: 'Card tokenized and initial checkout successful.', ip: '102.89.44.182' },
    ]
  }
];

export default function DisputesPage() {
  const [search, setSearch] = useState('');
  const [selectedCustId, setSelectedCustId] = useState(mockCustomerAudits[0].id);

  const filteredAudits = mockCustomerAudits.filter(cust => 
    cust.name.toLowerCase().includes(search.toLowerCase()) ||
    cust.email.toLowerCase().includes(search.toLowerCase()) ||
    cust.id.toLowerCase().includes(search.toLowerCase())
  );

  const currentCust = mockCustomerAudits.find(c => c.id === selectedCustId) || mockCustomerAudits[0];

  const handlePrintDispute = () => {
    window.print();
  };

  return (
    <div className="space-y-8 select-none relative">
      
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dispute Evidence Generator</h2>
          <p className="text-sm text-muted">Generate certified customer billing trails to challenge payment chargebacks and disputes.</p>
        </div>
      </div>

      {/* Main Panel Grid (Hidden when printing) */}
      <div className="grid gap-8 lg:grid-cols-12 items-start no-print">
        
        {/* Left Column: Customer Search & Selector (4 cols) */}
        <div className="lg:col-span-4 bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          <div className="divide-y divide-card-border max-h-[500px] overflow-y-auto">
            {filteredAudits.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">No customers found</div>
            ) : (
              filteredAudits.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustId(c.id)}
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1 ${
                    c.id === selectedCustId ? 'bg-muted-bg' : 'hover:bg-muted-bg/30'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-foreground">{c.name}</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                      c.status === 'active' 
                        ? 'bg-success-bg border-success-border text-success' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted truncate">{c.email}</span>
                  <span className="text-[9px] font-semibold text-muted bg-muted-bg px-1.5 py-0.5 rounded border border-card-border max-w-fit mt-1">
                    {c.id}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Customer Details Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-6 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-foreground">{currentCust.name}</h3>
                  <span className="text-[10px] font-bold text-muted bg-muted-bg px-2 py-0.5 rounded border border-card-border">
                    {currentCust.id}
                  </span>
                </div>
                <p className="text-xs text-muted">{currentCust.email} · {currentCust.plan}</p>
              </div>

              <button
                onClick={handlePrintDispute}
                className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Generate Dispute Package
              </button>
            </div>

            {/* Audit Sections */}
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Signup Metadata card */}
              <div className="border border-card-border bg-muted-bg/10 rounded-xl p-4 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Sign-Up Footprint
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-card-border/60">
                    <span className="text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> Timestamp</span>
                    <span className="font-semibold">{currentCust.signupDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-card-border/60">
                    <span className="text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> Signup IP</span>
                    <span className="font-semibold">{currentCust.signupIp}</span>
                  </div>
                  <div className="flex flex-col py-1 gap-1">
                    <span className="text-muted flex items-center gap-1"><Monitor className="w-3 h-3" /> Browser Header</span>
                    <span className="font-semibold text-[10px] text-muted leading-relaxed max-w-xs">{currentCust.device}</span>
                  </div>
                </div>
              </div>

              {/* Status and Summary card */}
              <div className="border border-card-border bg-muted-bg/10 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    Lemni Verification
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    This user registered card authorizations processed via Nomba gateway. Lemni Billing Engine tracked subsequent billing attempts, adhering to grace periods and dunning procedures.
                  </p>
                </div>
                <div className="bg-success-bg border border-success-border rounded-lg p-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                    Lemni Certified Record
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Attempts list */}
            <div className="mt-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Nomba Payment Logs
              </h4>
              <div className="border border-card-border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted-bg/60 border-b border-card-border text-[9px] font-bold uppercase tracking-wider text-muted">
                      <th className="py-2.5 px-4">Gateway ID</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Result</th>
                      <th className="py-2.5 px-4">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {currentCust.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-4 font-bold text-foreground">{p.id}</td>
                        <td className="py-2.5 px-4 text-muted">{p.date}</td>
                        <td className="py-2.5 px-4 font-extrabold text-foreground">{p.amount}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                            p.status === 'success' 
                              ? 'bg-success-bg border-success-border text-success' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted font-medium">{p.gatewayMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs timeline */}
            <div className="mt-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Lemni Billing Audit trail
              </h4>
              <div className="space-y-4 pl-4 border-l-2 border-card-border">
                {currentCust.logs.map((log, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-accent border-2 border-card-bg" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{log.action}</span>
                      <span className="text-[9px] text-muted font-medium">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">{log.details}</p>
                    <span className="text-[9px] text-muted/60 block">Trigger Host IP: {log.ip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* PRINT-ONLY COMPILATION DOCUMENT CARD */}
      <div className="hidden print:block print-card p-12 bg-white text-black min-h-screen">
        
        {/* Certificate Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold" style={{ color: "#2DCA73" }}>∞</span>
              <span className="font-cursive text-3xl font-bold text-black">Lemni Billing Systems</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">
              Dispute Evidence Audit Certificate
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">REPORT: #{currentCust.id}</div>
            <div className="text-[10px] text-gray-500 font-medium">Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Executive summary */}
        <div className="mb-8 p-4 border border-black rounded bg-gray-50">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Verification Statement</h4>
          <p className="text-xs leading-relaxed text-gray-700">
            This document certifies that the customer detailed below registered card tokenization credentials securely via Nomba payments bridge. Lemni Billing Engine has logged complete subscription tracking logs, dunning attempt logs, and device logs as system-certified details. This audit package conforms to standard payment network chargeback dispute guidelines.
          </p>
        </div>

        {/* Customer Footprint */}
        <div className="mb-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-2">Customer Profile & Signup Footprint</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="py-1"><strong>Name:</strong> {currentCust.name}</div>
              <div className="py-1"><strong>Email:</strong> {currentCust.email}</div>
              <div className="py-1"><strong>Selected Plan:</strong> {currentCust.plan}</div>
            </div>
            <div>
              <div className="py-1"><strong>Signup Timestamp:</strong> {currentCust.signupDate}</div>
              <div className="py-1"><strong>Signup Host IP:</strong> {currentCust.signupIp}</div>
              <div className="py-1"><strong>User Agent Headers:</strong> {currentCust.device}</div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-2">Nomba Gateway Transaction Logs</h4>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black text-gray-600 font-bold">
                <th className="py-2">Gateway ID</th>
                <th className="py-2">Date/Time</th>
                <th className="py-2">Billing Amount</th>
                <th className="py-2">Result</th>
                <th className="py-2">Gateway Return Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCust.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 font-bold">{p.id}</td>
                  <td className="py-2 text-gray-700">{p.date}</td>
                  <td className="py-2 font-bold">{p.amount}</td>
                  <td className="py-2">
                    <span className="uppercase font-bold text-[10px]">{p.status}</span>
                  </td>
                  <td className="py-2 text-gray-600">{p.gatewayMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit trail */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-2">Lemni Engine Event History</h4>
          <div className="space-y-3">
            {currentCust.logs.map((log, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{log.action}</span>
                  <span className="text-gray-500 font-medium">{log.timestamp}</span>
                </div>
                <p className="text-gray-600 mt-0.5">{log.details}</p>
                <span className="text-[9px] text-gray-400">Trigger Host: {log.ip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature stamp */}
        <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between items-center text-xs">
          <div>
            <div><strong>Verification Authority:</strong> Lemni Billing Engine</div>
            <div className="text-gray-500">Security Certificate MD5: c4ca4238a0b923820dcc509a6f75849b</div>
          </div>
          <div className="text-right">
            <div className="h-10 w-24 border border-black border-dashed flex items-center justify-center font-bold text-[10px] text-gray-500 uppercase tracking-widest">
              Lemni Secure
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Download,
  User,
  MapPin,
  Monitor,
  Calendar,
  FileCheck,
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { auditApi, CustomerRow, CustomerAuditDetail, ApiError } from '@/lib/api-client';

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatPrice(val: number | null): string {
  if (val === null) return '—';
  return `₦${val.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export default function DisputesPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerAuditDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadCustomers = async (searchTerm?: string) => {
    try {
      setCustomersLoading(true);
      setCustomersError(null);
      const result = await auditApi.listCustomers({ search: searchTerm, limit: '50' });
      setCustomers(result.data);
      if (result.data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(result.data[0].id);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load customers';
      setCustomersError(message);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!selectedCustomerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const data = await auditApi.getCustomerAudit(selectedCustomerId);
        setDetail(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to load customer audit trail';
        setDetailError(message);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [selectedCustomerId]);

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
                placeholder="Search by email or customer ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          {customersError && (
            <div className="p-4 text-xs text-rose-500 font-semibold">{customersError}</div>
          )}

          <div className="divide-y divide-card-border max-h-[500px] overflow-y-auto">
            {customersLoading ? (
              <div className="p-6 flex justify-center">
                <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">No customers found</div>
            ) : (
              customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1 ${
                    c.id === selectedCustomerId ? 'bg-muted-bg' : 'hover:bg-muted-bg/30'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-foreground truncate">{c.email}</span>
                    {c.status && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border whitespace-nowrap ${
                        c.status === 'active' || c.status === 'trialing'
                          ? 'bg-success-bg border-success-border text-success'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        {c.status}
                      </span>
                    )}
                  </div>
                  {c.planName && (
                    <span className="text-[10px] text-muted truncate">{c.planName} · {formatPrice(c.planAmount)}</span>
                  )}
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
          {detailLoading ? (
            <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-12 flex justify-center">
              <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : detailError ? (
            <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-12 text-center">
              <p className="text-sm font-semibold text-rose-500">{detailError}</p>
            </div>
          ) : !detail ? (
            <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-12 text-center">
              <p className="text-sm text-muted">Select a customer to view their audit trail.</p>
            </div>
          ) : (
            <div className="bg-card-bg border border-card-border rounded-xl shadow-sm p-6">

              {/* Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">{detail.customer.email}</h3>
                    <span className="text-[10px] font-bold text-muted bg-muted-bg px-2 py-0.5 rounded border border-card-border">
                      {detail.customer.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {detail.subscriptions[0]?.planName ?? 'No subscription'}
                    {detail.subscriptions[0] && ` · ${formatPrice(detail.subscriptions[0].planAmount)}`}
                  </p>
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
                      <span className="font-semibold">{formatDate(detail.customer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-card-border/60">
                      <span className="text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> Signup IP</span>
                      <span className="font-semibold">{detail.customer.signupIp ?? 'Not captured'}</span>
                    </div>
                    <div className="flex flex-col py-1 gap-1">
                      <span className="text-muted flex items-center gap-1"><Monitor className="w-3 h-3" /> Browser Header</span>
                      <span className="font-semibold text-[10px] text-muted leading-relaxed max-w-xs break-all">
                        {detail.customer.signupUserAgent ?? 'Not captured'}
                      </span>
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
                {detail.payments.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6 border border-dashed border-card-border rounded-lg">No payment attempts recorded</p>
                ) : (
                  <div className="border border-card-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted-bg/60 border-b border-card-border text-[9px] font-bold uppercase tracking-wider text-muted">
                          <th className="py-2.5 px-4">Transaction ID</th>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Amount</th>
                          <th className="py-2.5 px-4">Result</th>
                          <th className="py-2.5 px-4">Gateway Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border">
                        {detail.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-4 font-bold text-foreground">{p.id}</td>
                            <td className="py-2.5 px-4 text-muted">{formatDate(p.createdAt)}</td>
                            <td className="py-2.5 px-4 font-extrabold text-foreground">{formatPrice(p.amount)}</td>
                            <td className="py-2.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                                p.status === 'success'
                                  ? 'bg-success-bg border-success-border text-success'
                                  : p.status === 'pending'
                                  ? 'bg-slate-200 border-slate-300 text-slate-700'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-muted font-medium">{p.nombaRef ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Audit Logs timeline */}
              <div className="mt-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Lemni Billing Audit Trail
                </h4>
                {detail.timeline.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6 border border-dashed border-card-border rounded-lg">No lifecycle events recorded yet</p>
                ) : (
                  <div className="space-y-4 pl-4 border-l-2 border-card-border">
                    {detail.timeline.map((log) => (
                      <div key={log.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-accent border-2 border-card-bg" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[9px] text-muted font-medium">{formatDate(log.createdAt)}</span>
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-muted leading-relaxed">{log.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* PRINT-ONLY COMPILATION DOCUMENT CARD */}
      {detail && (
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
              <div className="text-sm font-bold">REPORT: #{detail.customer.id}</div>
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
                <div className="py-1"><strong>Email:</strong> {detail.customer.email}</div>
                <div className="py-1"><strong>Selected Plan:</strong> {detail.subscriptions[0]?.planName ?? 'N/A'}</div>
              </div>
              <div>
                <div className="py-1"><strong>Signup Timestamp:</strong> {formatDate(detail.customer.createdAt)}</div>
                <div className="py-1"><strong>Signup Host IP:</strong> {detail.customer.signupIp ?? 'Not captured'}</div>
                <div className="py-1"><strong>User Agent Headers:</strong> {detail.customer.signupUserAgent ?? 'Not captured'}</div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="mb-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-2">Nomba Gateway Transaction Logs</h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black text-gray-600 font-bold">
                  <th className="py-2">Transaction ID</th>
                  <th className="py-2">Date/Time</th>
                  <th className="py-2">Billing Amount</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Gateway Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detail.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 font-bold">{p.id}</td>
                    <td className="py-2 text-gray-700">{formatDate(p.createdAt)}</td>
                    <td className="py-2 font-bold">{formatPrice(p.amount)}</td>
                    <td className="py-2">
                      <span className="uppercase font-bold text-[10px]">{p.status}</span>
                    </td>
                    <td className="py-2 text-gray-600">{p.nombaRef ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit trail */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-2">Lemni Engine Event History</h4>
            <div className="space-y-3">
              {detail.timeline.map((log) => (
                <div key={log.id} className="text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500 font-medium">{formatDate(log.createdAt)}</span>
                  </div>
                  {log.details && <p className="text-gray-600 mt-0.5">{log.details}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Signature stamp */}
          <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between items-center text-xs">
            <div>
              <div><strong>Verification Authority:</strong> Lemni Billing Engine</div>
            </div>
            <div className="text-right">
              <div className="h-10 w-24 border border-black border-dashed flex items-center justify-center font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                Lemni Secure
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

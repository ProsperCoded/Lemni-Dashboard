'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Link2, Check } from 'lucide-react';
import { billingApi, ApiError, PlanRow } from '@/lib/api-client';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(12500);
  const [billingModel, setBillingModel] = useState<'recurring' | 'one_time' | 'custom_input'>('recurring');
  const [interval, setInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [trialDays, setTrialDays] = useState(0);
  const [trialRequireCard, setTrialRequireCard] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.listPlans();
      setPlans(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load plans';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFormLoading(true);
    try {
      const payload: {
        name: string;
        amount: number;
        billingModel: 'recurring' | 'one_time' | 'custom_input';
        trialDays: number;
        trialRequireCard: boolean;
        gracePeriodDays: number;
        interval?: 'weekly' | 'monthly' | 'yearly';
      } = {
        name,
        amount,
        billingModel,
        trialDays,
        trialRequireCard,
        gracePeriodDays,
      };

      if (billingModel === 'recurring') {
        payload.interval = interval;
      }

      if (editingId) {
        const updated = await billingApi.updatePlan(editingId, payload);
        setPlans(plans.map(p => p.id === editingId ? updated : p));
      } else {
        const newPlan = await billingApi.createPlan(payload);
        setPlans([...plans, newPlan]);
      }
      resetForm();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save plan';
      setError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      setDeleteError(null);
      await billingApi.deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setDeleteError('Cannot delete plan with active subscriptions');
      } else {
        const message = err instanceof ApiError ? err.message : 'Failed to delete plan';
        setDeleteError(message);
      }
    }
  };

  const handleCopyLink = async (planId: string) => {
    setLinkError(null);
    try {
      const { checkoutUrl } = await billingApi.getCheckoutLink(planId);
      await navigator.clipboard.writeText(checkoutUrl);
      setCopiedPlanId(planId);
      setTimeout(() => setCopiedPlanId(null), 1500);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to get checkout link';
      setLinkError(message);
    }
  };

  const handleEditPlan = (plan: PlanRow) => {
    setEditingId(plan.id);
    setName(plan.name);
    setAmount(plan.amount);
    setBillingModel(plan.billingModel);
    setInterval(plan.interval || 'monthly');
    setTrialDays(plan.trialDays);
    setTrialRequireCard(plan.trialRequireCard);
    setGracePeriodDays(plan.gracePeriodDays);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setAmount(12500);
    setBillingModel('recurring');
    setInterval('monthly');
    setTrialDays(0);
    setTrialRequireCard(false);
    setGracePeriodDays(0);
    setError(null);
  };

  const formatPrice = (val: number) => {
    return `₦${val.toLocaleString('en-NG')}`;
  };

  return (
    <div className="space-y-8 select-none">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing Plans</h2>
        <p className="text-sm text-muted">Create and manage subscription plans integrated with your checkout flow.</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Plan Form */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
            {editingId ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSavePlan} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pro Membership"
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Billing Model
                </label>
                <select
                  value={billingModel}
                  onChange={(e) => setBillingModel(e.target.value as 'recurring' | 'one_time' | 'custom_input')}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  <option value="recurring">Recurring</option>
                  <option value="one_time">One-Time</option>
                  <option value="custom_input">Custom Input</option>
                </select>
              </div>

              {billingModel === 'recurring' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Trial Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="trialCard"
                checked={trialRequireCard}
                onChange={(e) => setTrialRequireCard(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
                className="rounded"
              />
              <label htmlFor="trialCard" className="text-xs font-semibold text-muted cursor-pointer">
                Require card for trial
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {formLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingId ? (
                  'Update Plan'
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Plan
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-semibold border border-card-border hover:bg-muted-bg rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Plans List */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
            Your Plans
          </h3>

          {deleteError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{deleteError}</p>
            </div>
          )}

          {linkError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{linkError}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No plans yet. Create one above!</p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border border-card-border rounded-lg hover:bg-muted-bg/30 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(plan.amount)} • {plan.billingModel === 'recurring' ? plan.interval : 'One-time'} • Trial: {plan.trialDays}d
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(plan.id)}
                      className="p-2 text-muted hover:text-foreground hover:bg-muted-bg rounded-lg transition-colors"
                      title="Copy checkout link"
                    >
                      {copiedPlanId === plan.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Link2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => window.open(`/preview/${plan.id}`, '_blank')}
                      className="p-2 text-muted hover:text-foreground hover:bg-muted-bg rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="px-3 py-1.5 text-xs font-semibold border border-card-border hover:bg-muted-bg rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil,
  Eye,
  ExternalLink,
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'weekly' | 'monthly' | 'yearly';
  gracePeriodDays: number;
  status: 'active' | 'archived';
}

const initialPlans: Plan[] = [
  { id: '1', name: 'Basic Membership', description: 'Standard gym access during daytime hours.', price: 5000, interval: 'monthly', gracePeriodDays: 3, status: 'active' },
  { id: '2', name: 'Standard Membership', description: '24/7 all-club access and trainer consulting.', price: 12500, interval: 'monthly', gracePeriodDays: 5, status: 'active' },
  { id: '3', name: 'Max Membership', description: 'Full access, free apparel, spa perks, and private lockers.', price: 25000, interval: 'monthly', gracePeriodDays: 7, status: 'active' },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Form states for plan creation/editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(12500);
  const [interval, setInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [gracePeriodDays, setGracePeriodDays] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form submit handler
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      // Edit existing plan
      setPlans(plans.map(p => p.id === editingId ? {
        ...p,
        name,
        description,
        price,
        interval,
        gracePeriodDays
      } : p));
      setEditingId(null);
    } else {
      // Create new plan
      const newPlan: Plan = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        price,
        interval,
        gracePeriodDays,
        status: 'active'
      };
      setPlans([...plans, newPlan]);
    }

    // Reset form
    resetForm();
  };

  const handlePreviewPlan = (plan: Plan) => {
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price);
    setInterval(plan.interval);
    setGracePeriodDays(plan.gracePeriodDays);
    setEditingId(null);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price);
    setInterval(plan.interval);
    setGracePeriodDays(plan.gracePeriodDays);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice(12500);
    setInterval('monthly');
    setGracePeriodDays(5);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing Plans</h2>
        <p className="text-sm text-muted">Create and manage manual subscription plans integrated with your checkout flow.</p>
      </div>

      <div className="max-w-4xl items-start">
        {/* Left Side: Plan Editor & Plans List (8 cols) */}
        <div className="space-y-8">
          
          {/* Plan Form */}
          <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              {editingId ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h3>

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
                    placeholder="e.g. Pro Annual Membership"
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Billing Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Price (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="12500"
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Grace Period (Days)
                    </label>
                    <span className="text-[10px] text-muted font-medium">Extra days before account locking on failure</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:w-1/2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about what members get with this tier..."
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-card-border pt-6">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold border border-card-border hover:bg-muted-bg rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Plans List */}
          <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Active Plans ({plans.length})
              </h3>
            </div>

            <div className="divide-y divide-card-border">
              {plans.map((p) => (
                <div key={p.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted-bg/10 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-bg border-success-border border text-success">
                        {p.interval}
                      </span>
                    </div>
                    <p className="text-xs text-muted max-w-md">{p.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted pt-1">
                      <span>Grace: {p.gracePeriodDays} {p.gracePeriodDays === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0 border-card-border">
                    <span className="text-base font-extrabold text-foreground">{formatPrice(p.price)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/preview/${p.id}`, '_blank')}
                        className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-card-border rounded-lg hover:bg-[#2DCA73]/10 text-muted hover:text-[#2DCA73] hover:border-[#2DCA73]/30 transition-all cursor-pointer"
                        title="Open Checkout Link"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleEditPlan(p)}
                        className="p-1.5 border border-card-border rounded-lg hover:bg-muted-bg text-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-1.5 border border-card-border rounded-lg hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

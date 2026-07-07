"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Sparkles,
  Layers,
  Wand2,
  Check,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { billingApi, aiApi, ApiError, PlanRow } from "@/lib/api-client";

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(12500);
  const [billingModel, setBillingModel] = useState<
    "recurring" | "one_time" | "custom_input"
  >("recurring");
  const [interval, setInterval] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const [trialDays, setTrialDays] = useState(0);
  const [trialRequireCard, setTrialRequireCard] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // AI Plan Builder
  const [aiMode, setAiMode] = useState<"single" | "ladder">("single");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);

  // AI Pricing Strategist (ladder mode)
  type Tier = {
    name: string;
    tagline: string;
    amount: number;
    billingModel: "recurring" | "one_time";
    interval: "weekly" | "monthly" | "yearly";
    trialDays: number;
    trialRequireCard: boolean;
    gracePeriodDays: number;
  };
  const [ladderStrategy, setLadderStrategy] = useState<string | null>(null);
  const [ladderTiers, setLadderTiers] = useState<Tier[]>([]);
  const [ladderCreating, setLadderCreating] = useState(false);
  const [ladderCreated, setLadderCreated] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.listPlans();
      setPlans(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load plans";
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
        billingModel: "recurring" | "one_time" | "custom_input";
        trialDays: number;
        trialRequireCard: boolean;
        gracePeriodDays: number;
        interval?: "weekly" | "monthly" | "yearly";
      } = {
        name,
        amount,
        billingModel,
        trialDays,
        trialRequireCard,
        gracePeriodDays,
      };

      if (billingModel === "recurring") {
        payload.interval = interval;
      }

      if (editingId) {
        const updated = await billingApi.updatePlan(editingId, payload);
        setPlans(plans.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const newPlan = await billingApi.createPlan(payload);
        setPlans([...plans, newPlan]);
      }
      resetForm();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to save plan";
      setError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      setDeleteError(null);
      await billingApi.deletePlan(id);
      setPlans(plans.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setDeleteError("Cannot delete plan with active subscriptions");
      } else {
        const message =
          err instanceof ApiError ? err.message : "Failed to delete plan";
        setDeleteError(message);
      }
    }
  };

  const handleEditPlan = (plan: PlanRow) => {
    setEditingId(plan.id);
    setName(plan.name);
    setAmount(plan.amount);
    setBillingModel(plan.billingModel);
    setInterval(plan.interval || "monthly");
    setTrialDays(plan.trialDays);
    setTrialRequireCard(plan.trialRequireCard);
    setGracePeriodDays(plan.gracePeriodDays);
    setAiWarnings([]);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAmount(12500);
    setBillingModel("recurring");
    setInterval("monthly");
    setTrialDays(0);
    setTrialRequireCard(false);
    setGracePeriodDays(0);
    setError(null);
    setAiWarnings([]);
  };

  const formatPrice = (val: number) => {
    return `₦${val.toLocaleString("en-NG")}`;
  };

  const handleGenerateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiWarnings([]);
    try {
      const { plan, warnings } = await aiApi.generatePlan(aiPrompt);
      setEditingId(null);
      setName(plan.name);
      setAmount(plan.amount);
      setBillingModel(plan.billingModel);
      setInterval(plan.interval);
      setTrialDays(plan.trialDays);
      setTrialRequireCard(plan.trialRequireCard);
      setGracePeriodDays(plan.gracePeriodDays);
      setAiWarnings(warnings);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to generate plan";
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // Assumed subscriber count for the illustrative MRR estimate on each tier card.
  const MRR_SAMPLE_SUBS = 100;

  // Normalize any recurring interval to a monthly figure so tiers are comparable.
  const estimateMonthlyRevenue = (tier: Tier) => {
    if (tier.billingModel !== "recurring") return null;
    const perMonth =
      tier.interval === "weekly"
        ? tier.amount * 4.345
        : tier.interval === "yearly"
          ? tier.amount / 12
          : tier.amount;
    return Math.round(perMonth * MRR_SAMPLE_SUBS);
  };

  const handleGenerateLadder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setLadderStrategy(null);
    setLadderTiers([]);
    setLadderCreated(null);
    try {
      const { strategy, plans: tiers } = await aiApi.generateLadder(aiPrompt);
      setLadderStrategy(strategy);
      setLadderTiers(tiers);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to generate pricing ladder";
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // Load a generated tier into the manual form for fine-tuning (tagline is display-only).
  const loadTierIntoForm = (tier: Tier) => {
    setEditingId(null);
    setName(tier.name);
    setAmount(tier.amount);
    setBillingModel(tier.billingModel);
    setInterval(tier.interval);
    setTrialDays(tier.trialDays);
    setTrialRequireCard(tier.trialRequireCard);
    setGracePeriodDays(tier.gracePeriodDays);
    setAiWarnings([]);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateAllTiers = async () => {
    if (ladderTiers.length === 0) return;
    setLadderCreating(true);
    setError(null);
    setLadderCreated(null);
    const created: PlanRow[] = [];
    let failures = 0;
    // Sequential to keep ordering deterministic and avoid hammering the backend.
    for (const tier of ladderTiers) {
      try {
        const payload = {
          name: tier.name,
          amount: tier.amount,
          billingModel: tier.billingModel,
          trialDays: tier.trialDays,
          trialRequireCard: tier.trialRequireCard,
          gracePeriodDays: tier.gracePeriodDays,
          ...(tier.billingModel === "recurring"
            ? { interval: tier.interval }
            : {}),
        };
        created.push(await billingApi.createPlan(payload));
      } catch {
        failures += 1;
      }
    }
    if (created.length > 0) setPlans((prev) => [...prev, ...created]);
    setLadderCreating(false);
    if (failures === 0) {
      setLadderCreated(`Created all ${created.length} tiers 🎉`);
      setLadderTiers([]);
      setLadderStrategy(null);
    } else if (created.length > 0) {
      setLadderCreated(
        `Created ${created.length} of ${ladderTiers.length} tiers — ${failures} failed.`,
      );
    } else {
      setError("Failed to create the generated tiers. Please try again.");
    }
  };

  const handleGenerateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiWarnings([]);
    try {
      const { plan, warnings } = await aiApi.generatePlan(aiPrompt);
      setEditingId(null);
      setName(plan.name);
      setAmount(plan.amount);
      setBillingModel(plan.billingModel);
      setInterval(plan.interval);
      setTrialDays(plan.trialDays);
      setTrialRequireCard(plan.trialRequireCard);
      setGracePeriodDays(plan.gracePeriodDays);
      setAiWarnings(warnings);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to generate plan";
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // Assumed subscriber count for the illustrative MRR estimate on each tier card.
  const MRR_SAMPLE_SUBS = 100;

  // Normalize any recurring interval to a monthly figure so tiers are comparable.
  const estimateMonthlyRevenue = (tier: Tier) => {
    if (tier.billingModel !== "recurring") return null;
    const perMonth =
      tier.interval === "weekly"
        ? tier.amount * 4.345
        : tier.interval === "yearly"
          ? tier.amount / 12
          : tier.amount;
    return Math.round(perMonth * MRR_SAMPLE_SUBS);
  };

  const handleGenerateLadder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setLadderStrategy(null);
    setLadderTiers([]);
    setLadderCreated(null);
    try {
      const { strategy, plans: tiers } = await aiApi.generateLadder(aiPrompt);
      setLadderStrategy(strategy);
      setLadderTiers(tiers);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to generate pricing ladder";
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // Load a generated tier into the manual form for fine-tuning (tagline is display-only).
  const loadTierIntoForm = (tier: Tier) => {
    setEditingId(null);
    setName(tier.name);
    setAmount(tier.amount);
    setBillingModel(tier.billingModel);
    setInterval(tier.interval);
    setTrialDays(tier.trialDays);
    setTrialRequireCard(tier.trialRequireCard);
    setGracePeriodDays(tier.gracePeriodDays);
    setAiWarnings([]);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateAllTiers = async () => {
    if (ladderTiers.length === 0) return;
    setLadderCreating(true);
    setError(null);
    setLadderCreated(null);
    const created: PlanRow[] = [];
    let failures = 0;
    // Sequential to keep ordering deterministic and avoid hammering the backend.
    for (const tier of ladderTiers) {
      try {
        const payload = {
          name: tier.name,
          amount: tier.amount,
          billingModel: tier.billingModel,
          trialDays: tier.trialDays,
          trialRequireCard: tier.trialRequireCard,
          gracePeriodDays: tier.gracePeriodDays,
          ...(tier.billingModel === "recurring"
            ? { interval: tier.interval }
            : {}),
        };
        created.push(await billingApi.createPlan(payload));
      } catch {
        failures += 1;
      }
    }
    if (created.length > 0) setPlans((prev) => [...prev, ...created]);
    setLadderCreating(false);
    if (failures === 0) {
      setLadderCreated(`Created all ${created.length} tiers 🎉`);
      setLadderTiers([]);
      setLadderStrategy(null);
    } else if (created.length > 0) {
      setLadderCreated(
        `Created ${created.length} of ${ladderTiers.length} tiers — ${failures} failed.`,
      );
    } else {
      setError("Failed to create the generated tiers. Please try again.");
    }
  };

  return (
    <div className="space-y-8 select-none">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Billing Plans
        </h2>
        <p className="text-sm text-muted">
          Create and manage subscription plans integrated with your checkout
          flow.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* AI Plan Builder */}
        <div className="bg-gradient-to-br from-[#2DCA73]/5 to-transparent border border-card-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                AI Plan Builder
              </h3>
              <p className="text-xs text-muted mt-1">
                {aiMode === "single"
                  ? "Describe a plan in plain English — AI fills the form below for you to review."
                  : "Describe your business — AI designs a full pricing ladder you can launch in one click."}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-muted-bg border border-card-border rounded-lg p-0.5 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAiMode("single");
                  setAiError(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  aiMode === "single"
                    ? "bg-card-bg text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" /> Single
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode("ladder");
                  setAiError(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  aiMode === "ladder"
                    ? "bg-card-bg text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Pricing Ladder
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{aiError}</p>
            </div>
          )}

          <form
            onSubmit={
              aiMode === "single" ? handleGenerateWithAi : handleGenerateLadder
            }
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={
                aiMode === "single"
                  ? "e.g. Bill users ₦5,000 monthly, with a 14-day free trial, no card required upfront"
                  : "e.g. I run a gym and want three membership tiers"
              }
              className="flex-1 px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {aiLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : aiMode === "single" ? (
                <>
                  <Sparkles className="w-4 h-4" /> Generate
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" /> Design Ladder
                </>
              )}
            </button>
          </form>

          {/* Example prompt chips */}
          <div className="flex flex-wrap gap-2">
            {(aiMode === "single"
              ? [
                  "₦12,500/mo gym membership, 7-day trial",
                  "One-time ₦25,000 course fee",
                  "Yearly ₦120,000 pro plan",
                ]
              : [
                  "I run a gym, three membership tiers",
                  "SaaS tool: free, pro, and business tiers",
                  "Streaming service, basic to premium",
                ]
            ).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setAiPrompt(chip)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-card-border text-muted hover:text-foreground hover:border-[#2DCA73]/40 hover:bg-[#2DCA73]/5 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Single-mode: defaulted-field warnings */}
          {aiMode === "single" && aiWarnings.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Defaulted fields — please review
              </p>
              <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                {aiWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ladder success banner */}
          {aiMode === "ladder" && ladderCreated && (
            <div className="p-3 bg-success-bg border border-success-border rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <p className="text-xs font-semibold text-success">
                {ladderCreated}
              </p>
            </div>
          )}

          {/* Ladder results */}
          {aiMode === "ladder" && ladderTiers.length > 0 && (
            <div className="space-y-4 pt-2">
              {ladderStrategy && (
                <div className="p-3 bg-background border border-card-border rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Pricing Strategy
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {ladderStrategy}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ladderTiers.map((tier, idx) => {
                  const mrr = estimateMonthlyRevenue(tier);
                  const highlight =
                    idx === Math.floor((ladderTiers.length - 1) / 2);
                  return (
                    <div
                      key={`${tier.name}-${idx}`}
                      className={`relative rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                        highlight
                          ? "border-[#2DCA73]/50 bg-[#2DCA73]/5 shadow-[0_4px_20px_-4px_rgba(45,202,115,0.2)]"
                          : "border-card-border bg-background"
                      }`}
                    >
                      {highlight && (
                        <span className="absolute -top-2 left-4 text-[9px] font-bold uppercase tracking-wider bg-[#2DCA73] text-white px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {tier.name}
                        </p>
                        <p className="text-[11px] text-muted leading-snug mt-0.5">
                          {tier.tagline}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-foreground">
                          {formatPrice(tier.amount)}
                        </span>
                        <span className="text-[10px] text-muted font-semibold uppercase">
                          {tier.billingModel === "recurring"
                            ? `/ ${tier.interval}`
                            : "one-time"}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-muted">
                        {tier.trialDays > 0 && (
                          <p>
                            ✓ {tier.trialDays}-day free trial
                            {tier.trialRequireCard ? " (card required)" : ""}
                          </p>
                        )}
                        {tier.gracePeriodDays > 0 && (
                          <p>✓ {tier.gracePeriodDays}-day grace period</p>
                        )}
                        {mrr !== null && (
                          <p className="flex items-center gap-1 text-[#2DCA73] font-semibold pt-1">
                            <TrendingUp className="w-3 h-3" /> ≈{" "}
                            {formatPrice(mrr)}/mo at {MRR_SAMPLE_SUBS} subs
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => loadTierIntoForm(tier)}
                        className="mt-auto text-[11px] font-semibold text-muted hover:text-foreground flex items-center gap-1.5 self-start cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3 h-3" /> Fine-tune in
                        form
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateAllTiers}
                  disabled={ladderCreating}
                  className="px-4 py-2 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                >
                  {ladderCreating ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create all{" "}
                      {ladderTiers.length} tiers
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLadderTiers([]);
                    setLadderStrategy(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold border border-card-border hover:bg-muted-bg rounded-lg transition-colors cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plan Form */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
            {editingId
              ? "Edit Subscription Plan"
              : "Create New Subscription Plan"}
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
                  onChange={(e) =>
                    setBillingModel(
                      e.target.value as
                        | "recurring"
                        | "one_time"
                        | "custom_input",
                    )
                  }
                  className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  <option value="recurring">Recurring</option>
                  <option value="one_time">One-Time</option>
                  <option value="custom_input">Custom Input</option>
                </select>
              </div>

              {billingModel === "recurring" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) =>
                      setInterval(
                        e.target.value as "weekly" | "monthly" | "yearly",
                      )
                    }
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
                style={{ accentColor: "var(--accent)" }}
                className="rounded"
              />
              <label
                htmlFor="trialCard"
                className="text-xs font-semibold text-muted cursor-pointer"
              >
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
                  "Update Plan"
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
              <p className="text-xs font-semibold text-rose-500">
                {deleteError}
              </p>
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
            <p className="text-xs text-muted text-center py-8">
              No plans yet. Create one above!
            </p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border border-card-border rounded-lg hover:bg-muted-bg/30 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {plan.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatPrice(plan.amount)} •{" "}
                      {plan.billingModel === "recurring"
                        ? plan.interval
                        : "One-time"}{" "}
                      • Trial: {plan.trialDays}d
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
                      onClick={() => handleOpenLink(plan.id)}
                      className="p-2 text-muted hover:text-foreground hover:bg-muted-bg rounded-lg transition-colors"
                      title="Open checkout link"
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

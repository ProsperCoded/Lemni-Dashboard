// NEW FILE: no shared schema/validation layer existed in the codebase before this
// (src/lib/api-client.ts only has hand-written TS interfaces, no runtime validation).
// This is the single source of truth for the AI-generated plan shape — both the
// API route and any client code that needs to re-validate should import from here.
import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  billingModel: z.enum(['recurring', 'one_time']),
  // Only meaningful when billingModel === 'recurring', but always present on the wire.
  interval: z.enum(['weekly', 'monthly', 'yearly']),
  trialDays: z.number().min(0),
  trialRequireCard: z.boolean(),
  gracePeriodDays: z.number().min(0),
});

export type GeneratedPlan = z.infer<typeof planSchema>;

export const generatePlanResponseSchema = planSchema.extend({
  warnings: z.array(z.string()),
});

export type GeneratePlanResponse = z.infer<typeof generatePlanResponseSchema>;

// --- AI Pricing Strategist (multi-tier ladder) ---
// A single tier in a generated pricing ladder. Extends the core plan shape with a
// display-only `tagline` (the one-line value prop shown on the tier card). `tagline`
// is stripped before the plan is forwarded to the real backend, which only accepts
// the core planSchema fields.
export const ladderPlanSchema = planSchema.extend({
  tagline: z.string().min(1),
});

export type LadderPlan = z.infer<typeof ladderPlanSchema>;

export const generateLadderResponseSchema = z.object({
  // 1–2 sentence explanation of the overall pricing strategy (shown to the merchant).
  strategy: z.string().min(1),
  plans: z.array(ladderPlanSchema).min(1).max(5),
});

export type GenerateLadderResponse = z.infer<typeof generateLadderResponseSchema>;

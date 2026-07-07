import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, FunctionCallingConfigMode, type FunctionDeclaration } from '@google/genai';
import { generatePlanResponseSchema } from '@/lib/schemas/plan';

// Forced function calling (Gemini's equivalent of tool_use) — the model is required
// to call this function via toolConfig mode ANY, so the output arrives as a structured
// args object, NOT free-text JSON we have to parse.
const PROPOSE_PLAN_FUNCTION: FunctionDeclaration = {
  name: 'propose_plan',
  description:
    "Propose a structured subscription billing plan for the Lemni billing engine, based on the merchant's plain-English description.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Short, human-readable plan name.' },
      amount: { type: Type.NUMBER, description: 'Price in NGN (Nigerian Naira). Must be >= 0.' },
      billingModel: { type: Type.STRING, enum: ['recurring', 'one_time'] },
      interval: {
        type: Type.STRING,
        enum: ['weekly', 'monthly', 'yearly'],
        description:
          'Only meaningful when billingModel is "recurring". Still required for "one_time" — default to "monthly" in that case.',
      },
      trialDays: { type: Type.NUMBER, description: 'Free trial length in days. Must be >= 0.' },
      trialRequireCard: {
        type: Type.BOOLEAN,
        description: 'Whether a card is required upfront to start the trial.',
      },
      gracePeriodDays: {
        type: Type.NUMBER,
        description: 'Days of continued access after a failed payment before lockout. Must be >= 0.',
      },
      warnings: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'One entry per field you defaulted because the prompt did not specify it (e.g. "amount defaulted to 0 — not mentioned in the prompt"). Empty array if nothing was defaulted.',
      },
    },
    required: [
      'name',
      'amount',
      'billingModel',
      'interval',
      'trialDays',
      'trialRequireCard',
      'gracePeriodDays',
      'warnings',
    ],
  },
};

const SYSTEM_PROMPT = `You convert a merchant's plain-English description of a subscription billing plan into a structured plan definition for the Lemni billing engine, by calling the propose_plan function.

Rules:
- amount is in Nigerian Naira (NGN), as a non-negative number.
- billingModel is "recurring" for subscriptions or "one_time" for a single payment.
- interval is only semantically relevant when billingModel is "recurring", but the field is always required — default it to "monthly" when billingModel is "one_time" or not specified.
- trialDays, gracePeriodDays must be non-negative integers.
- trialRequireCard is true only if the description explicitly says a card is required upfront for the trial.
- Do NOT guess at unstated values. For any field the prompt does not specify, use these defaults exactly: amount: 0, billingModel: "recurring", trialDays: 0, trialRequireCard: false, gracePeriodDays: 0 — and add one entry to "warnings" per defaulted field explaining what was defaulted and why.
- Always call the propose_plan function with your answer. Never respond with plain text.`;

const MODEL = 'gemini-2.5-flash';

async function callGemini(ai: GoogleGenAI, prompt: string, retryNote?: string) {
  const contents = retryNote ? `${prompt}\n\n${retryNote}` : prompt;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: [PROPOSE_PLAN_FUNCTION] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['propose_plan'],
        },
      },
    },
  });

  // functionCalls[].args is already a structured object — no JSON.parse of model text.
  return response.functionCalls?.[0]?.args;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ message: 'A prompt is required' }, { status: 400 });
  }

  // GOOGLE_API_KEY is read server-side only and never sent to the client — this route
  // is the only place it is referenced anywhere in the codebase.
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: 'AI plan generation is not configured (missing GOOGLE_API_KEY)' },
      { status: 503 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let raw = await callGemini(ai, prompt);
    let parsed = generatePlanResponseSchema.safeParse(raw);

    if (!parsed.success) {
      const retryNote = `Your previous function call produced invalid input: ${parsed.error.message}. Call propose_plan again with corrected values that satisfy the schema exactly.`;
      raw = await callGemini(ai, prompt, retryNote);
      parsed = generatePlanResponseSchema.safeParse(raw);
    }

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'AI could not generate a valid plan from that description. Please refine it and try again.' },
        { status: 422 },
      );
    }

    const { warnings, ...plan } = parsed.data;
    return NextResponse.json({ plan, warnings });
  } catch (err) {
    console.error('AI plan generation error:', err);
    return NextResponse.json({ message: 'Failed to generate plan' }, { status: 502 });
  }
}

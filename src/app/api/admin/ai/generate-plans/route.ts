import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, FunctionCallingConfigMode, type FunctionDeclaration } from '@google/genai';
import { generateLadderResponseSchema } from '@/lib/schemas/plan';

// AI Pricing Strategist — turns one plain-English description of a business into a
// complete, coherent pricing ladder (multiple tiers) in a single forced function call.
const PROPOSE_LADDER_FUNCTION: FunctionDeclaration = {
  name: 'propose_pricing_ladder',
  description:
    "Design a complete subscription pricing ladder (a set of coherent tiers) for a merchant's business, based on their plain-English description.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      strategy: {
        type: Type.STRING,
        description:
          'One or two sentences explaining the overall pricing strategy and how the tiers relate (good/better/best, value anchoring, etc.).',
      },
      plans: {
        type: Type.ARRAY,
        description: 'The tiers, ordered cheapest to most expensive. Provide 2–4 tiers unless the merchant asks for a specific number.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Short tier name, e.g. "Basic", "Standard", "Max".' },
            tagline: { type: Type.STRING, description: 'A punchy one-line value proposition for this tier.' },
            amount: { type: Type.NUMBER, description: 'Price in NGN (Nigerian Naira). Must be >= 0.' },
            billingModel: { type: Type.STRING, enum: ['recurring', 'one_time'] },
            interval: {
              type: Type.STRING,
              enum: ['weekly', 'monthly', 'yearly'],
              description: 'Billing interval. Default "monthly" when billingModel is "one_time".',
            },
            trialDays: { type: Type.NUMBER, description: 'Free trial length in days. Must be >= 0.' },
            trialRequireCard: { type: Type.BOOLEAN, description: 'Whether a card is required upfront for the trial.' },
            gracePeriodDays: {
              type: Type.NUMBER,
              description: 'Days of access after a failed payment before lockout. Must be >= 0.',
            },
          },
          required: [
            'name',
            'tagline',
            'amount',
            'billingModel',
            'interval',
            'trialDays',
            'trialRequireCard',
            'gracePeriodDays',
          ],
        },
      },
    },
    required: ['strategy', 'plans'],
  },
};

const SYSTEM_PROMPT = `You are a subscription pricing strategist for the Lemni billing engine. Given a merchant's plain-English description of their business, design a complete, coherent pricing ladder by calling the propose_pricing_ladder function.

Rules:
- Produce 2–4 well-differentiated tiers unless the merchant asks for a specific number. Order them cheapest to most expensive.
- Use realistic Nigerian Naira (NGN) prices with sensible spacing between tiers (value anchoring — the top tier makes the middle look reasonable).
- amount, trialDays, gracePeriodDays are non-negative numbers.
- billingModel is "recurring" for subscriptions or "one_time" for single payments. interval is required; default it to "monthly" for one_time.
- Give each tier a short name and a punchy one-line tagline.
- trialRequireCard is true only if it makes strategic sense (e.g. higher tiers).
- Make the tiers feel like a real product ladder a founder would ship. Always call the function; never reply in plain text.`;

const MODEL = 'gemini-2.5-flash';

async function callGemini(ai: GoogleGenAI, prompt: string, retryNote?: string) {
  const contents = retryNote ? `${prompt}\n\n${retryNote}` : prompt;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: [PROPOSE_LADDER_FUNCTION] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['propose_pricing_ladder'],
        },
      },
    },
  });

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

  // GOOGLE_API_KEY is read server-side only and never exposed to the client.
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
    let parsed = generateLadderResponseSchema.safeParse(raw);

    if (!parsed.success) {
      const retryNote = `Your previous function call produced invalid input: ${parsed.error.message}. Call propose_pricing_ladder again with corrected values that satisfy the schema exactly.`;
      raw = await callGemini(ai, prompt, retryNote);
      parsed = generateLadderResponseSchema.safeParse(raw);
    }

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'AI could not design a valid pricing ladder from that description. Please refine it and try again.' },
        { status: 422 },
      );
    }

    return NextResponse.json(parsed.data);
  } catch (err) {
    console.error('AI pricing ladder error:', err);
    return NextResponse.json({ message: 'Failed to generate pricing ladder' }, { status: 502 });
  }
}

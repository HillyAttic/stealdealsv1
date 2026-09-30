import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free';

export async function POST(req: NextRequest) {
  try {
    const { message, financialContext, isThankYou, projections, specialInstructions } = await req.json();

    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const prompt = `You are a property investment assistant for StealDeals in India.
    ${message.contextInfo || ''}

    ${financialContext || ''}

    User query: ${message.text || message}

    IMPORTANT INSTRUCTIONS:
    1. Always use Indian rupees (₹) in your responses, NOT dollars. All monetary values should be displayed with the ₹ symbol and formatted according to Indian number conventions.

    2. Keep your responses EXTREMELY BRIEF AND CONCISE - no more than 3-4 short sentences unless the user explicitly asks for detailed information.

    3. DO NOT use asterisks (**) or other markdown formatting in your responses. Use plain text only.

    4. When listing items, use simple dashes (-) instead of bullets or asterisks.

    ${isThankYou ? `5. Since the user is expressing gratitude, DO NOT ask for any financial information. Instead, provide a brief, friendly response about our three calculators (Averser, Moderate, and Taker) and encourage them to try the calculator tabs above.` :
    `5. If you have the user's financial information (income, expenses, funds) AND the user is asking about calculations or projections, ALWAYS include the specific projected values in your response. DO NOT ask for information you already have.

    6. When you have the financial details, provide a very brief analysis:
       - For Averser (low risk): Provide the specific amount after 5 years: ₹${projections?.averser?.toLocaleString('en-IN') || '[calculated amount]'}
       - For Moderate: Provide the specific amount after 5 years: ₹${projections?.moderate?.toLocaleString('en-IN') || '[calculated amount]'}
       - For Taker: Provide the specific amount after 5 years: ₹${projections?.taker?.toLocaleString('en-IN') || '[calculated amount]'}`}

    ${specialInstructions || ''}

    Respond in a helpful but extremely concise manner. Avoid lengthy explanations.`;

    // Without this the widget's typing dots spin forever when the (free-tier) model
    // queues. On timeout we 504 and the widget shows its own fallback reply.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
          // ponytail: nemotron is a reasoning model — left on, its thinking runs past
          // max_tokens and leaks the raw thought into the reply as the answer.
          // Ignored by non-reasoning models, so safe to leave if MODEL is swapped.
          reasoning: { enabled: false },
        }),
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error(`OpenRouter timed out after 20s (model: ${MODEL})`);
        return NextResponse.json({ error: 'Model timed out' }, { status: 504 });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json({ error: 'API request failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) {
      console.error('Unexpected OpenRouter response structure:', data);
      return NextResponse.json({ error: 'Unexpected response structure', details: data }, { status: 502 });
    }

    // ponytail: keep the Gemini envelope so the widget's parser is untouched. Swap to choices[0] here if the widget ever gets updated.
    return NextResponse.json({ candidates: [{ content: { parts: [{ text }] } }] });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

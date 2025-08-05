import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Extract the message and context from the request body
    const { message, financialContext, isThankYou, projections, specialInstructions } = await req.json();
    
    // Get API key from environment variables (secured server-side)
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Prepare the context and prompt similar to the original implementation
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

    // Call the Gemini API securely from the server
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json({ error: 'API request failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 
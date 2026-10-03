import { NextResponse } from 'next/server';

const MODEL = 'gemini-1.5-flash';
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

function buildHeaders(apiKey: string) {
  // AQ / ya29 = OAuth2 bearer token; AIza = standard API key
  if (apiKey.startsWith('AIza')) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
}

function buildUrl(apiKey: string, action: string) {
  if (apiKey.startsWith('AIza')) {
    return `${BASE}:${action}?key=${apiKey}`;
  }
  return `${BASE}:${action}`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(buildUrl(apiKey, 'generateContent'), {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are the IRON LOG AI Coach, an elite fitness and nutrition expert. Give concise, science-backed advice on bodybuilding, fat loss, and metabolism. Speak with confident, motivating energy." }] },
        contents
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || JSON.stringify(data);
      return NextResponse.json({ error: `Gemini Error (${res.status}): ${msg}` }, { status: res.status });
    }

    return NextResponse.json({ message: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response." });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

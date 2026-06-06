// src/app/api/voice/synthesize/route.ts
// Receives text → returns audio via OpenAI TTS or empty response for browser TTS fallback
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'nova' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice,
        }),
      });

      if (!response.ok) throw new Error('TTS API failed');

      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuffer.byteLength),
        },
      });
    }

    // Return indication to use browser TTS
    return NextResponse.json({ useBrowserTTS: true, text });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ useBrowserTTS: true }, { status: 200 });
  }
}

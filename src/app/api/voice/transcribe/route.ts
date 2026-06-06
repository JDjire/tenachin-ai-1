// src/app/api/voice/transcribe/route.ts
// Receives audio blob → transcribes via OpenAI Whisper or mock fallback
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      // Real OpenAI Whisper call
      const whisperForm = new FormData();
      whisperForm.append('file', audioFile, 'audio.webm');
      whisperForm.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: whisperForm,
      });

      if (!response.ok) throw new Error('Whisper API failed');
      const data = await response.json();
      return NextResponse.json({ transcript: data.text });
    }

    // Mock fallback
    return NextResponse.json({
      transcript: 'Can I eat this food? I have diabetes.',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}

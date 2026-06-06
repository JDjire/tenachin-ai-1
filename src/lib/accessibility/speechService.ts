// ─────────────────────────────────────────────────────────────
// src/lib/accessibility/speechService.ts
// Voice I/O using Web Speech API + OpenAI TTS / Whisper fallback
// ─────────────────────────────────────────────────────────────

export type SpeechLanguage = 'en-US' | 'am-ET' | 'or-ET';

let recognition: SpeechRecognition | null = null;
let synthesis: SpeechSynthesis | null = null;

// ─── Speech-to-Text (STT) ────────────────────────────────────

export function startListening(
  lang: SpeechLanguage = 'en-US',
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (err: string) => void
): void {
  if (typeof window === 'undefined') return;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => {
    onEnd?.();
    recognition = null;
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError?.(event.error);
    recognition = null;
  };

  recognition.start();
}

export function stopListening(): void {
  recognition?.stop();
  recognition = null;
}

export function isListeningSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

// ─── Text-to-Speech (TTS) ────────────────────────────────────

export function speak(
  text: string,
  lang: SpeechLanguage = 'en-US',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') return;

  synthesis = window.speechSynthesis;
  synthesis.cancel(); // cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (onEnd) utterance.onend = onEnd;

  synthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// ─── OpenAI TTS fallback (server-side) ───────────────────────

export async function speakViaOpenAI(
  text: string,
  voice: 'alloy' | 'nova' | 'shimmer' = 'nova'
): Promise<void> {
  try {
    const res = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) throw new Error('TTS API failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch {
    // Fall back to Web Speech API
    speak(text);
  }
}

// ─── OpenAI Whisper transcription (server-side) ──────────────

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  const res = await fetch('/api/voice/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Transcription API failed');
  const data = await res.json();
  return data.transcript as string;
}

// ─── Audio Recorder helper ───────────────────────────────────

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export async function startRecording(): Promise<void> {
  if (typeof window === 'undefined') return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.start();
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve) => {
    if (!mediaRecorder) {
      resolve(new Blob());
      return;
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      resolve(blob);
    };
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    mediaRecorder = null;
  });
}

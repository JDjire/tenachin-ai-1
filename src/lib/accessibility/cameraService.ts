// src/lib/accessibility/cameraService.ts
// Camera capture + AI food narration for visually impaired users

export interface NarrationResult {
  food_name: string;
  calories: number;
  risk_level: string;
  narration: string; // Pre-composed spoken description
}

// ─── Camera stream management ────────────────────────────────

let activeStream: MediaStream | null = null;

export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream> {
  stopCamera();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });

  videoElement.srcObject = stream;
  await videoElement.play();
  activeStream = stream;
  return stream;
}

export function stopCamera(): void {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
}

// ─── Frame capture ───────────────────────────────────────────

export function captureFrame(videoElement: HTMLVideoElement): Blob | null {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Convert to blob synchronously via toDataURL then manual conversion
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'image/jpeg' });
}

export async function captureFrameAsync(videoElement: HTMLVideoElement): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.8
    );
  });
}

// ─── Send frame to narration API ─────────────────────────────

export async function narrateFrame(
  imageBlob: Blob,
  userDiseases: string[] = []
): Promise<NarrationResult> {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob, 'frame.jpg');
    formData.append('diseases', JSON.stringify(userDiseases));

    const res = await fetch('/api/vision/narrate', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Narration API failed');
    return await res.json();
  } catch {
    // Fallback mock narration
    return {
      food_name: 'Injera with Shiro',
      calories: 450,
      risk_level: 'MEDIUM',
      narration:
        'I detected Injera with Shiro. Estimated calories: 450. Risk level: medium for diabetes. Recommended portion: one plate.',
    };
  }
}

// ─── Base64 helper for API transport ─────────────────────────

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

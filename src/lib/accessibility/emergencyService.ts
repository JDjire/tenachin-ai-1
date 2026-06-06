// src/lib/accessibility/emergencyService.ts
// Emergency detection, hospital lookup, and SOS coordination

export interface HospitalResult {
  name: string;
  distance: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface EmergencyTriageResult {
  condition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  instructions: string;
  needsHospital: boolean;
  nearestHospital?: HospitalResult;
  audioScript: string; // Pre-composed text to be spoken aloud
}

// ─── Emergency contacts (pre-loaded for Ethiopia) ─────────────
export const ETHIOPIA_EMERGENCY_CONTACTS = [
  { label: 'Ethiopia Emergency (Police)', number: '911' },
  { label: 'Ambulance (Addis Ababa)', number: '907' },
  { label: 'Fire Brigade', number: '939' },
  { label: 'Ethiopian Red Cross', number: '+251 11 551 9364' },
];

// ─── Geolocation helper ───────────────────────────────────────
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

// ─── Hospital lookup (OpenStreetMap Nominatim + Overpass API) ──
export async function findNearestHospital(lat: number, lng: number): Promise<HospitalResult | null> {
  try {
    // Use Overpass API to find nearby hospitals
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        way["amenity"="hospital"](around:5000,${lat},${lng});
      );
      out center 5;
    `;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!res.ok) throw new Error('Overpass API error');
    const data = await res.json();

    if (!data.elements || data.elements.length === 0) return null;

    const hospital = data.elements[0];
    const hLat = hospital.lat ?? hospital.center?.lat ?? lat;
    const hLng = hospital.lon ?? hospital.center?.lon ?? lng;

    // Calculate rough distance in km
    const R = 6371;
    const dLat = ((hLat - lat) * Math.PI) / 180;
    const dLng = ((hLng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((hLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return {
      name: hospital.tags?.name ?? 'Nearest Hospital',
      distance: `${dist.toFixed(1)} km`,
      address: hospital.tags?.['addr:street'] ?? 'Address not available',
      phone: hospital.tags?.phone,
      lat: hLat,
      lng: hLng,
    };
  } catch {
    // Fallback mock for demo
    return {
      name: 'Black Lion Hospital',
      distance: '1.4 km',
      address: 'Lideta, Addis Ababa',
      phone: '+251 11 551 6835',
    };
  }
}

// ─── Full emergency triage via API ───────────────────────────
export async function triageEmergency(
  symptoms: string,
  userDiseases: string[]
): Promise<EmergencyTriageResult> {
  try {
    let location: { lat: number; lng: number } | null = null;
    try {
      const pos = await getCurrentLocation();
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      // Location unavailable, continue without it
    }

    const res = await fetch('/api/emergency/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, userDiseases, location }),
    });

    if (!res.ok) throw new Error('Triage API error');
    return await res.json();
  } catch {
    // Fallback mock
    const lc = symptoms.toLowerCase();
    const isDizzy = lc.includes('dizzy') || lc.includes('faint') || lc.includes('dizziness');
    const isChestPain = lc.includes('chest') || lc.includes('heart');

    if (isDizzy) {
      return {
        condition: 'Potential Hypoglycemia',
        severity: 'HIGH',
        instructions:
          'Please consume a fast-acting sugar source such as fruit juice or candy immediately. Sit down in a safe place.',
        needsHospital: true,
        nearestHospital: { name: 'Black Lion Hospital', distance: '1.4 km', address: 'Lideta, Addis Ababa' },
        audioScript:
          'Warning. Potential hypoglycemia detected. Please consume a fast-acting sugar source and seek medical attention. Nearest hospital is 1.4 kilometers away.',
      };
    }
    if (isChestPain) {
      return {
        condition: 'Possible Cardiac Event',
        severity: 'HIGH',
        instructions: 'This is a medical emergency. Rest immediately and call an ambulance.',
        needsHospital: true,
        nearestHospital: { name: 'Black Lion Hospital', distance: '1.4 km', address: 'Lideta, Addis Ababa' },
        audioScript:
          'Emergency. Possible cardiac event detected. Call ambulance now. Nearest hospital is 1.4 kilometers away. Rest and stay calm.',
      };
    }
    return {
      condition: 'Mild Symptoms',
      severity: 'LOW',
      instructions: 'Monitor your symptoms. Rest and stay hydrated.',
      needsHospital: false,
      audioScript: 'Your symptoms appear mild. Please rest and stay hydrated. Monitor for any changes.',
    };
  }
}

// ─── SOS action ──────────────────────────────────────────────
export async function triggerSOS(contactsToCall: typeof ETHIOPIA_EMERGENCY_CONTACTS) {
  let locationText = 'Location unavailable';
  try {
    const pos = await getCurrentLocation();
    locationText = `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`;
  } catch {
    // ignore
  }

  return {
    contacts: contactsToCall,
    locationText,
    message: `EMERGENCY SOS from Tenachin AI user. Location: ${locationText}`,
  };
}
